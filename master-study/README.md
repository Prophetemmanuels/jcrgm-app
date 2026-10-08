# JCRGM Master Study

This app belongs in the `master-study/` subfolder beside your site's root `index.html`. In the ready-to-upload ZIP, the included root `index.html` is a copy of your uploaded JCRGM homepage with one added tile linking to `./master-study/index.html`. Use that copy if you want the homepage link automatically; otherwise keep your current root homepage and add the link shown below.

Upload this whole folder, not only `index.html`. The app HTML is under 1 MB. Ten natural-sounding, AI-generated English MP3 lessons are in `audio/` and load only when played, improving phone load time. They are synthetic narration, not a human recording.

The app's `manifest.json`, `icons/`, and `sw.js` are local to this subfolder. Its service worker scope is `/master-study/` and does not replace the site's root `service-worker.js`. The first app shell is cached quickly; each selected lesson can be cached for offline playback after it is fetched once. Bible APIs and external study links may still need internet.

Optional homepage tile (add inside an existing `.nav-grid`):

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

Notes and lesson progress remain in the browser on the current device. Back up in Settings & Data.
