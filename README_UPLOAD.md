# Correct GitHub upload for the Master Bible Study tile

This bundle is tailored to your uploaded JCRGM homepage. The app **replaces the existing “JCRGM Master Study” tile inside the “Study & Prayer” category**; it does not add another tile elsewhere.

## Upload the homepage and app

1. Extract the ZIP.
2. Upload/commit its root `index.html` to the **repository root**, replacing the current root `index.html` with this updated copy.
3. Upload the complete `master-study/` folder beside it, including `audio/`, `icons/`, and `elevenlabs-worker/`. Do not move the app's `index.html` to the repository root or omit the MP3s.
4. Keep the other existing site files, especially the current root `service-worker.js`.

The Study & Prayer tile reads **Master Bible Study** and opens `./master-study/index.html`. The app has its own `master-study/sw.js` and PWA manifest scoped to that subfolder, so the homepage and study app remain separate. The root homepage stays `/index.html`; the study app is `/master-study/index.html`.

## Read Aloud voices

Read Aloud defaults to the best voice exposed by the browser/device. The app now favors enhanced/neural and online system voices when available, which may improve phone playback without an app model download, API key, account, or Worker setup. The same selected voice is shared with guided meditation. Phone voices can still sound flatter than computer voices because the operating system controls the available voices; if needed, tap **Re-scan voices** and enable an enhanced text-to-speech voice in the phone’s accessibility settings.

For a more consistent natural English voice on phones, the optional Kokoro Studio voice is offered in **Settings → Voice Studio → Show optional natural-voice option**. It downloads about 90 MB only after **Install** is tapped, then generates speech on-device. After it is ready, choose **Use Studio for reading**. ElevenLabs v4 also remains optional. ElevenLabs requires a separately deployed Cloudflare Worker, provider API credits, and explicit consent before text is sent online. The secure Worker, Turnstile, rate-limit, and key setup steps are in `master-study/elevenlabs-worker/README.md`. Never put an ElevenLabs API key in public JavaScript, local storage, or GitHub.

The ten Voice Teacher lessons remain their original prerecorded MP3s. Their exact narrator is not automatically available as a live model simply because the MP3s are included. An authorized clone/source voice would need to be created in the provider account before it can be selected; the app's default system voice is separate from that narrator.

## Homepage and app performance

The app stays in `master-study/`. Its lesson tracks load on demand, and its scoped service worker keeps the app cache separate from the root homepage service worker. On phones, lesson shortcuts are full-width buttons below the “Choose a lesson” instructions; mobile actions stack below their copy with larger tap targets. A Safari-incompatible regular-expression feature was removed so the app script—and navigation—can run on older iOS Safari such as the iPhone 7. The ZIP preserves the homepage content and existing audio assets. After GitHub Pages publishes, the app URL is `https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/master-study/` (or `.../master-study/index.html`).
