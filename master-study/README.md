# JCRGM Master Study app (deployed in `master-study/`)

This folder is the Bible study app. Keep the repository's homepage `index.html` at the root; this app's own `index.html` stays here as `master-study/index.html`.

The companion root `README_UPLOAD.md` explains the ready-to-upload homepage integration. That root homepage replaces the existing **JCRGM Master Study** tile in **Study & Prayer** with **Master Bible Study** and points it to `./master-study/index.html`. Do not add a second tile elsewhere.

Upload this complete folder, including `audio/`, `icons/`, `manifest.json`, `sw.js`, and this README. The app service worker is scoped to the subfolder; retain the existing root `service-worker.js`.

## Read Aloud voice

For English, live Read Aloud, Scripture, study pages, sermon/prayer text, and guided meditation use the same selected neural Studio voice. The first install is about 90 MB; the app asks before an on-demand install. Use Wi-Fi if possible. The model runs on the phone and requires no account, API key, or paid speech API; lower-powered phones may take longer to prepare or speak. The model is English-only, so other delivery languages use the best matching voice installed on the device. The ten narrated course lessons remain separate natural-sounding MP3s in `audio/` and still load only when played.

For the app URL, open `https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/master-study/` (or end with `master-study/index.html`).
