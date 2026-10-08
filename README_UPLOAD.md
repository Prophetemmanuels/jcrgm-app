# Correct GitHub upload for the Master Bible Study tile

This bundle is tailored to your uploaded JCRGM homepage. The new app **replaces the existing “JCRGM Master Study” tile inside the “Study & Prayer” category**; it does not add another tile elsewhere.

## Upload

1. Extract the ZIP.
2. Upload/commit its root `index.html` to the **repository root**, replacing the current `index.html` with this updated copy.
3. Upload the complete `master-study/` folder beside it. Do not move the app's `index.html` to the repository root and do not omit the `audio/` folder.
4. Keep the other existing site files, especially the current root `service-worker.js`.

The Study & Prayer tile now reads **Master Bible Study** and opens `./master-study/index.html`. The app has its own `master-study/sw.js` and PWA manifest scoped to that subfolder, so the two pages and workers remain separate.

After GitHub Pages publishes, the app URL is `https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/master-study/` (or `.../master-study/index.html`).

The root homepage remains the site's `/index.html`; the Bible app is `/master-study/index.html`. The app HTML is about 686 KB. Ten MP3 lessons are separate and load only when played.

## Realistic Read Aloud voice

In English, Read Aloud and guided meditation now use the same neural Studio voice instead of the phone's built-in voice. The app asks before the first approximately 90 MB install; use Wi-Fi. The model is generated on the phone and uses no paid speech API or API key. The download is on demand and does not slow the first page opening. If your first Read Aloud or Begin Journey tap installs the model, tap that control again after setup; future page loads restore the saved model when it is first used. Lower-powered phones may take longer. The Studio model is English-only; other selected delivery languages still rely on the best matching voice installed on the phone.
