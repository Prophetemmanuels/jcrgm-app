const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // ElevenLabs quickstart narrator: George
const DEFAULT_MODEL_ID = "eleven_v4";
const MAX_TEXT_CHARS = 9000; // leave headroom below Eleven v4's 10,000-character limit
const VOICE_CACHE_MS = 10 * 60 * 1000;

let voiceCache = null;
let voiceCacheExpires = 0;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status, origin, extra) {
  const headers = new Headers({
    ...corsHeaders(origin),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...(extra || {})
  });
  return new Response(JSON.stringify(data), { status: status || 200, headers });
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return origin && allowed.includes(origin) ? origin : "";
}

function defaultVoiceId(env) {
  return String(env.ELEVENLABS_DEFAULT_VOICE_ID || DEFAULT_VOICE_ID).trim();
}

function modelId(env) {
  const requested = String(env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID).trim();
  return requested === "eleven_multilingual_v2" ? requested : DEFAULT_MODEL_ID;
}

function cleanLabels(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
      out[String(key).slice(0, 40)] = String(raw).slice(0, 120);
    }
  }
  return out;
}

function publicVoice(voice, isDefault) {
  const preview = typeof voice.preview_url === "string" && voice.preview_url.startsWith("https://")
    ? voice.preview_url
    : "";
  return {
    voice_id: String(voice.voice_id || ""),
    name: String(voice.name || "Voice").slice(0, 120),
    category: String(voice.category || "").slice(0, 60),
    description: String(voice.description || "").slice(0, 240),
    labels: cleanLabels(voice.labels),
    preview_url: preview,
    is_default: !!isDefault
  };
}

async function elevenLabsJson(path, env) {
  const response = await fetch("https://api.elevenlabs.io" + path, {
    method: "GET",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY }
  });
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 400);
    throw new Error("ElevenLabs voice lookup failed (HTTP " + response.status + "). " + detail);
  }
  return response.json();
}

async function getVoiceCatalog(env) {
  if (voiceCache && Date.now() < voiceCacheExpires) return voiceCache;
  if (!env.ELEVENLABS_API_KEY) throw new Error("The ElevenLabs API secret is not configured on the Worker.");

  const data = await elevenLabsJson("/v2/voices?page_size=100&include_total_count=false", env);
  const voices = Array.isArray(data.voices) ? data.voices.map(voice => publicVoice(voice, false)).filter(voice => voice.voice_id) : [];
  const defaultId = defaultVoiceId(env);

  if (!voices.some(voice => voice.voice_id === defaultId)) {
    let defaultMeta = null;
    try {
      const escaped = encodeURIComponent(defaultId);
      defaultMeta = await elevenLabsJson("/v1/voices/" + escaped, env);
    } catch (error) {
      // Keep the documented sample voice visible even if the account's voice list omits it.
    }
    voices.unshift(publicVoice(defaultMeta || {
      voice_id: defaultId,
      name: defaultId === DEFAULT_VOICE_ID ? "George — warm narrative voice" : "Configured default voice",
      labels: { language: "en", use_case: "narration" }
    }, true));
  } else {
    const item = voices.find(voice => voice.voice_id === defaultId);
    if (item) item.is_default = true;
    voices.sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.name.localeCompare(b.name));
  }

  voiceCache = voices.slice(0, 100);
  voiceCacheExpires = Date.now() + VOICE_CACHE_MS;
  return voiceCache;
}

async function voiceIsAllowed(env, id) {
  const catalog = await getVoiceCatalog(env);
  if (catalog.some(voice => voice.voice_id === id)) return true;

  // Allow a valid account voice beyond the first catalog page, but never arbitrary caller-supplied IDs.
  try {
    const data = await elevenLabsJson("/v2/voices?voice_ids=" + encodeURIComponent(id), env);
    const voices = Array.isArray(data.voices) ? data.voices : [];
    if (voices.some(voice => String(voice.voice_id) === id)) {
      voiceCache = catalog.concat(voices.map(voice => publicVoice(voice, false))).slice(0, 150);
      return true;
    }
  } catch (error) {
    // The normal validation error below is intentionally generic.
  }
  return false;
}

function turnstileConfigured(env) {
  const siteKey = String(env.TURNSTILE_SITE_KEY || "").trim();
  return !!(siteKey && !/^(paste|replace|your[-_])/i.test(siteKey) && env.TURNSTILE_SECRET_KEY);
}

async function verifyTurnstile(token, request, origin, env) {
  if (!turnstileConfigured(env) || !token) return false;
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.set("remoteip", ip);

  let result;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form
    });
    result = await response.json();
  } catch (error) {
    return false;
  }
  if (!result || !result.success) return false;
  const expectedHost = new URL(origin).hostname.toLowerCase();
  return !result.hostname || String(result.hostname).toLowerCase() === expectedHost;
}

async function enforceRateLimit(request, env, origin) {
  if (!env.TTS_RATE_LIMITER || typeof env.TTS_RATE_LIMITER.limit !== "function") {
    return json({ error: "rate_limiter_not_configured", message: "The Worker rate limiter is not configured." }, 503, origin);
  }
  const ip = request.headers.get("CF-Connecting-IP") || "unknown-client";
  try {
    const result = await env.TTS_RATE_LIMITER.limit({ key: ip });
    if (!result || !result.success) {
      return json({ error: "rate_limited", message: "Too many speech requests. Wait a minute and try again." }, 429, origin, { "Retry-After": "60" });
    }
  } catch (error) {
    // Fail closed: this endpoint can incur paid usage.
    return json({ error: "rate_limiter_unavailable", message: "The Worker rate limiter could not be checked." }, 503, origin);
  }
  return null;
}

async function handleRequest(request, env) {
  const origin = allowedOrigin(request, env);
  if (!origin) return new Response("Origin not allowed", { status: 403, headers: { "Cache-Control": "no-store" } });
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method === "GET" && url.pathname === "/config") {
    const apiConfigured = !!env.ELEVENLABS_API_KEY;
    const turnstileIsReady = turnstileConfigured(env);
    return json({
      provider: "ElevenLabs",
      model_id: modelId(env),
      default_voice_id: defaultVoiceId(env),
      api_configured: apiConfigured,
      turnstile_required: true,
      turnstile_configured: turnstileIsReady,
      turnstile_site_key: turnstileIsReady ? String(env.TURNSTILE_SITE_KEY || "") : "",
      ready: apiConfigured && turnstileIsReady
    }, 200, origin);
  }

  if (request.method === "GET" && url.pathname === "/voices") {
    try {
      const voices = await getVoiceCatalog(env);
      return json({ voices, default_voice_id: defaultVoiceId(env), model_id: modelId(env) }, 200, origin);
    } catch (error) {
      return json({ error: "voice_list_failed", message: String(error && error.message || "Voice list unavailable.").slice(0, 400) }, 502, origin);
    }
  }

  if (request.method === "POST" && url.pathname === "/tts") {
    const blocked = await enforceRateLimit(request, env, origin);
    if (blocked) return blocked;

    if (!env.ELEVENLABS_API_KEY) {
      return json({ error: "provider_not_configured", message: "Add ELEVENLABS_API_KEY as a Cloudflare Worker secret." }, 503, origin);
    }
    if (!turnstileConfigured(env)) {
      return json({ error: "turnstile_not_configured", message: "Configure Cloudflare Turnstile for this public speech endpoint." }, 503, origin);
    }
    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 50000) return json({ error: "request_too_large", message: "Request body is too large." }, 413, origin);

    let body;
    try {
      const raw = await request.text();
      if (raw.length > 50000) return json({ error: "request_too_large", message: "Request body is too large." }, 413, origin);
      body = JSON.parse(raw);
    } catch (error) {
      return json({ error: "invalid_json", message: "Send a JSON request." }, 400, origin);
    }

    const text = typeof body.text === "string" ? body.text : "";
    const textLength = Array.from(text).length;
    if (!text.trim()) return json({ error: "empty_text", message: "Text is required." }, 400, origin);
    if (textLength > MAX_TEXT_CHARS) return json({ error: "text_too_long", message: "Text must be 9,000 characters or fewer per request." }, 413, origin);

    const voiceId = typeof body.voice_id === "string" ? body.voice_id.trim() : "";
    if (!voiceId || voiceId.length > 100 || !/^[A-Za-z0-9_-]+$/.test(voiceId)) {
      return json({ error: "invalid_voice", message: "Choose an available voice." }, 400, origin);
    }
    let allowed = false;
    try { allowed = await voiceIsAllowed(env, voiceId); } catch (error) {}
    if (!allowed) return json({ error: "voice_not_allowed", message: "That voice is not available to this ElevenLabs account." }, 403, origin);

    const human = await verifyTurnstile(String(body.turnstile_token || ""), request, origin, env);
    if (!human) return json({ error: "human_check_failed", message: "Security check failed. Try the reading again." }, 403, origin);

    const model = modelId(env);
    const ttsBody = {
      text,
      model_id: model,
      voice_settings: {
        stability: 0.58,
        similarity_boost: 0.82,
        use_speaker_boost: true
      }
    };
    const language = typeof body.language_code === "string" ? body.language_code.toLowerCase() : "";
    if (model === "eleven_v4" && /^[a-z]{2}$/.test(language)) ttsBody.language_code = language;
    const previousText = typeof body.previous_text === "string" ? body.previous_text : "";
    const nextText = typeof body.next_text === "string" ? body.next_text : "";
    if (previousText) ttsBody.previous_text = Array.from(previousText).slice(-500).join("");
    if (nextText) ttsBody.next_text = Array.from(nextText).slice(0, 500).join("");

    const endpoint = "https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(voiceId) + "?output_format=mp3_44100_128";
    let upstream;
    try {
      upstream = await fetch(endpoint, {
        method: "POST",
        headers: {
          "xi-api-key": env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify(ttsBody)
      });
    } catch (error) {
      return json({ error: "provider_network_error", message: "Could not reach ElevenLabs. Check the Worker network and try again." }, 502, origin);
    }

    if (!upstream.ok) {
      const detail = (await upstream.text().catch(() => "")).slice(0, 700);
      return json({ error: "elevenlabs_error", message: "ElevenLabs returned HTTP " + upstream.status + (detail ? ": " + detail : "") }, 502, origin);
    }

    const headers = new Headers({
      ...corsHeaders(origin),
      "Content-Type": upstream.headers.get("Content-Type") || "audio/mpeg",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    return new Response(upstream.body, { status: 200, headers });
  }

  return json({ error: "not_found", message: "Route not found." }, 404, origin);
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      const origin = allowedOrigin(request, env);
      if (origin) return json({ error: "worker_error", message: "Speech proxy failed safely. Check its deployment configuration." }, 500, origin);
      return new Response("Origin not allowed", { status: 403, headers: { "Cache-Control": "no-store" } });
    }
  }
};
