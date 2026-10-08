# Correct GitHub upload for the Master Bible Study tile

This bundle is tailored to your uploaded JCRGM homepage. The app **replaces the existing “JCRGM Master Study” tile inside the “Study & Prayer” category**; it does not add another tile elsewhere.

## Upload the homepage and app

1. Extract the ZIP.
2. Upload/commit its root `index.html` to the **repository root**, replacing the current root `index.html` with this updated copy.
3. Upload the complete `master-study/` folder beside it, including `audio/`, `icons/`, and `elevenlabs-worker/`. Do not move the app's `index.html` to the repository root or omit the MP3s.
4. Keep the other existing site files, especially the current root `service-worker.js`.

The Study & Prayer tile reads **Master Bible Study** and opens `./master-study/index.html`. The app has its own `master-study/sw.js` and PWA manifest scoped to that subfolder, so the homepage and study app remain separate. The root homepage stays `/index.html`; the study app is `/master-study/index.html`.

## Read Aloud voices

Read Aloud now defaults to the best-ranked voice already exposed by the browser/device. It does not require a speech-model download, API key, provider account, or Worker setup. The same selected system voice is shared with guided meditation. The actual voice quality depends on the voices already installed or enabled by the device; if none appear, tap **Re-scan voices** and check the operating system’s text-to-speech accessibility settings.

The Kokoro Studio voice (about 90 MB) and ElevenLabs v4 are still optional alternatives, not prerequisites. ElevenLabs requires a separately deployed Cloudflare Worker, provider API credits, and explicit consent before text is sent online. The secure Worker, Turnstile, rate-limit, and key setup steps are in `master-study/elevenlabs-worker/README.md`. Never put an ElevenLabs API key in public JavaScript, local storage, or GitHub.

The ten Voice Teacher lessons remain their original prerecorded MP3s. Their exact narrator is not automatically available as a live model simply because the MP3s are included. An authorized clone/source voice would need to be created in the provider account before it can be selected; the app's default system voice is separate from that narrator.

## Homepage and app performance

The app stays in `master-study/`. Its lesson tracks load on demand, and its scoped service worker keeps the app cache separate from the root homepage service worker. The ZIP preserves the homepage content and existing audio assets. After GitHub Pages publishes, the app URL is `https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/master-study/` (or `.../master-study/index.html`).
