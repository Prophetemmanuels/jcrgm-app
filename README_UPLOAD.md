# Upload these files to your existing GitHub Pages repository

This is the ready-to-upload layout. It keeps your current homepage and adds one working link to the Bible study app.

## Files to upload

At the **repository root**, upload:

- `index.html` — your uploaded JCRGM homepage, preserved with one extra **Master Bible Study** tile in the Church Growth & Discipleship section. It links to `./master-study/index.html`.
- the entire `master-study/` folder — app, ten separate audio files, icons, manifest, and its scoped service worker. Do not upload only the app's HTML.

Keep the other files already in your repo, especially the existing root `service-worker.js`; this package does not replace it. The study app uses its own `master-study/sw.js`, whose scope is only the `master-study/` path.

## GitHub Pages address

After pushing, open `https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/master-study/` or `.../master-study/index.html`. The new tile on the homepage opens that same app.

The two `index.html` files are separate routes: `/index.html` remains the homepage and `/master-study/index.html` is the Bible study. GitHub Pages serves both.

## Performance and voices

The study app HTML is about 678 KB. Narrated MP3 lessons are separate and load only when played; the service worker caches each lesson after first successful playback. The device voice pickers now refresh both controls, retry briefly, and offer a **Re-scan voices** button instead of remaining stuck on a loading label.
