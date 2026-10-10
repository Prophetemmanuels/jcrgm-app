# JCRGM MASTER STUDY — Complete Edition

This package is optimized for GitHub and phones, including older iOS Safari such as the iPhone 7: mobile navigation is tap-friendly, controls stack under their copy, lesson shortcuts appear as full-width buttons under the “Choose a lesson” instructions, and the app avoids a newer regular-expression feature that stopped its script from running on older Safari. The `index.html` app is kept separate from its ten Voice Teacher lesson MP3s. Each lesson loads on demand, keeping the initial app open quick. The secure optional ElevenLabs proxy source is included in `elevenlabs-worker/`; deploying it is separate and is not required for Read Aloud.

## Publish on GitHub

1. Extract the ZIP.
2. Upload **all contents** of `JCRGM_MASTER_STUDY_Complete_Package` together (`index.html`, `audio/`, `manifest.json`, `sw.js`, `icons/`, `elevenlabs-worker/`, and `README.md`). Do not upload `index.html` alone; the lesson players and optional cloud-voice setup need their accompanying files.
3. Enable GitHub Pages for the repository and open the published app URL.

## Install / offline use

The package includes a web-app manifest, icons, and service worker. PWA installation and service workers require HTTPS (GitHub Pages provides it) or localhost. The first install caches only the app shell for a quicker start. Each lesson MP3 is fetched when played and cached individually; after that first successful play, it can be available offline in a supported browser. Bible text APIs and external research links require internet unless a passage has been cached or a permitted Bible file imported.

You can also open `index.html` locally, provided the `audio/` folder remains beside it. A single copied HTML file without that folder will not contain the audio tracks.

## Voice choices

- **Browser/device voice — default:** the app ranks available voices, favoring enhanced/neural options and online system voices (which can sound more natural on phones) when the browser exposes them. It needs no app model download, cloud account, API key, or setup. Voice quality and the voice list still depend on the device. If no voices appear, tap **Re-scan voices** and enable a system text-to-speech voice in accessibility settings.
- **On-device Kokoro Studio — optional phone quality upgrade:** a natural English voice generated in the browser. If phone voices still sound poor, open **Settings → Voice Studio → Show optional natural-voice option**. The first install is about 90 MB and begins only after you tap **Install**; it is not needed for Read Aloud. After installation, tap **Use Studio for reading** to switch to it. It may run more slowly on lower-powered phones and is separate from the Voice Teacher narrator.
- **ElevenLabs v4 — optional online voice:** the app can send Read Aloud, Scripture, sermons, prayers, study text, and guided-meditation narration through the bundled Cloudflare Worker. It loads voices available to the API key. See [`elevenlabs-worker/README.md`](elevenlabs-worker/README.md) if you later choose to set it up. Cloud reading sends text online and consumes API credits; the app asks for consent first. Keep provider keys only in Cloudflare Worker secrets, never in the app or GitHub.

As checked on **8 October 2026**, the ElevenLabs API pricing page showed v4 at **$0.08 per 1,000 characters** (with a temporary $0.022 promotion marked through 12 October 2026). Plans, credit accounting, promotions, and regional billing can change; check current provider pricing before enabling cloud reading.

The ten Voice Teacher tracks are the original prerecorded MP3s and remain unchanged. An MP3 alone is not a reusable speech model, so this package does **not** claim that any live TTS voice is identical to the teacher. If you own the recording or have the narrator’s explicit authorization, you can arrange an approved clone/source voice in your ElevenLabs account; once available through the account API, it can appear in the cloud dropdown. No clone is created here.

Your notes and course progress stay in the current browser/device unless you export a backup; they do not automatically synchronize to another phone. Use **Settings & Data → Full backup & restore** regularly. For offline Bible imports, use only text you are legally allowed to store.
