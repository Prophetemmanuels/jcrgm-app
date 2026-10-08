# JCRGM Master Study (subfolder app)

This is a separate app for an existing JCRGM GitHub Pages site. Put the entire `master-study/` folder beside your current root `index.html`; do not rename or overwrite the existing homepage.

The app route will be `https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/master-study/` (or end the URL with `master-study/index.html`). Its own `index.html`, `manifest.json`, `sw.js`, icons, and audio folder are contained here. The app service worker scope is limited to `/master-study/`, so it does not replace the existing site's root `service-worker.js`.

`index.html` is about 678 KB. Ten AI-generated, natural-sounding voice lessons are stored as separate MP3 files in `audio/`, each loaded only when played. This keeps first load quick and avoids a multi-megabyte HTML file. Upload the complete folder, including all ten MP3s.

To link from the existing homepage, add this tile inside an existing `.nav-grid`:

```html
<a class="tile" href="./master-study/index.html" aria-label="Open JCRGM Master Study">
  <span class="t-ico c-indigo">📖</span>
  <span class="t-txt">
    <span class="t-name">Master Bible Study</span>
    <span class="t-sub">Guided Bible study, memory, prayer, and teaching</span>
  </span>
  <span class="t-ext">→</span>
</a>
```

GitHub Pages uses HTTPS, so the app's manifest and subfolder service worker can run there. The app shell caches first; each audio lesson is cached on first successful play. Online Bible APIs and external research resources still need connectivity unless Scripture has been cached or imported.
