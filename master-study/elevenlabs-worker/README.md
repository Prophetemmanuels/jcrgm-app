# Secure ElevenLabs proxy for JCRGM Master Study

This Cloudflare Worker keeps the ElevenLabs API key server-side. The public GitHub Pages app calls this Worker; it never receives or stores the provider secret. The Worker also requires Cloudflare Turnstile on every paid speech request, checks the exact allowed site origin, validates that the selected voice belongs to the ElevenLabs account, caps request length, and rate-limits generation requests.

## One-time setup

1. Create an ElevenLabs API key. Restrict its permissions to the voice-list and text-to-speech operations needed by this Worker, and set an account/key credit limit. Do **not** paste the key into the app, this folder, `wrangler.toml`, or GitHub.
2. In Cloudflare, create a Turnstile widget for the exact GitHub Pages hostname (for example, `your-account.github.io`). Copy its **site key** and **secret key**.
3. Edit `wrangler.toml`:
   - Set `ALLOWED_ORIGINS` to the exact origin of the published app: `https://your-account.github.io`. Do not include `/repository/master-study/` in this value; browser Origin headers contain only scheme and host. Add a custom site origin after a comma if needed.
   - Replace `TURNSTILE_SITE_KEY` with the public site key.
   - Optionally set `ELEVENLABS_DEFAULT_VOICE_ID` to a voice available in your account. The default `JBFqnCBsd6RMkjVDRZzb` is the official ElevenLabs quickstart example voice, George.
   - Keep `ELEVENLABS_MODEL_ID = "eleven_v4"` for the recommended expressive narrator. You can change it to `eleven_multilingual_v2` for the model ElevenLabs describes as most stable on long-form generations.
   - Change `namespace_id` to a positive integer unique to your Cloudflare account if `901001` is already in use.
4. From this folder, use Wrangler 4.36.0 or newer (the included rate-limit binding requires it). Deploy the Worker and add secrets through Wrangler:

   ```sh
   npx wrangler@latest deploy
   npx wrangler@latest secret put ELEVENLABS_API_KEY
   npx wrangler@latest secret put TURNSTILE_SECRET_KEY
   ```

   If deploying secrets after the first publish, deploy again if Wrangler asks. The secret prompts take the values interactively; never put the values in the command history or a file.
5. Copy the Worker base URL shown by Cloudflare (for example, `https://jcrgm-elevenlabs-tts.<your-subdomain>.workers.dev`). In the app, open **Settings & Data → Voice Studio**, paste that base URL, and choose **Save and connect**. The app will confirm the voice catalog is reachable. Then select **ElevenLabs v4** as the reading engine and choose one of the voices available to the API key. Check the cloud-speech consent box before the first generated reading.

If you use GitHub Pages at a project URL, the allowed origin is still `https://YOUR-ACCOUNT.github.io` (no repo or folder path). If the app is served from a custom domain, add that exact HTTPS origin to `ALLOWED_ORIGINS` and to the Turnstile widget's hostnames.

## How it works / safety

- Routes: `GET /config`, `GET /voices`, and `POST /tts`.
- The Worker never logs the submitted reading text or saves generated audio. It forwards text to ElevenLabs; the provider's own account retention and privacy settings still apply. Do not use cloud Read Aloud for private pastoral notes or sensitive content unless you are comfortable sending that text to the provider.
- The frontend sends one passage chunk at a time (up to 4,500 characters, below the provider's 10,000-character Eleven v4 request limit) and supplies nearby text to help preserve continuity. The Worker enforces a 9,000-character ceiling per request.
- Each generation request needs a fresh Turnstile token. The Worker enforces exact-origin CORS and a Cloudflare per-location rate limit of 20 TTS requests per minute per client IP. Rate limits are protective, not a billing guarantee; also set a provider credit limit and monitor usage.
- CORS by itself is not authentication. Turnstile, rate limiting, restricted API permissions, and a credit cap are all included for a public Pages site.
- An ElevenLabs API key is never placed in HTML, JavaScript, local storage, or the GitHub repository. Only the non-secret Worker URL and Turnstile site key are used by the browser.
- The on-device Kokoro Studio voice and browser/device speech remain available as fallbacks. The existing ten Voice Teacher MP3 lessons are unchanged. An MP3 alone is not a reusable model; an authorized voice clone/source ID must be created in ElevenLabs and available to the API account before that exact narrator appears in the cloud voice list.

## Troubleshooting

- `Origin not allowed`: fix `ALLOWED_ORIGINS` to match the published host exactly, then redeploy.
- `Turnstile is not configured` / `Security check failed`: confirm both Turnstile keys, the configured hostname, and the app URL. The site key is a regular Worker variable; the secret is a Wrangler secret.
- No voices appear: check that the ElevenLabs key can list voices and that the account has API access to the selected voice. The API voice list includes voices available to that key; library access can depend on plan.
- Speech is rejected: check the ElevenLabs plan, voice availability, model access, remaining credit/character quota, and the Worker logs for the HTTP status (the request text itself is not logged by this code).
- If a premium request fails, the app offers the existing local Studio or device/browser speech instead of silently switching engines.
