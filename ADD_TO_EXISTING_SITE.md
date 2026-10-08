# Add the study app without replacing your current homepage

1. Extract this ZIP. It contains a `master-study/` folder.
2. Copy that folder into the **same repository directory as your existing root `index.html`**. Do not replace the root file.
3. Commit and push the new folder. Your existing homepage remains at `/`; the study app lives at `/master-study/index.html`.
4. Optional: add the tile shown in `master-study/README.md` to an existing `.nav-grid` in the homepage so visitors can click through.

Example GitHub Pages URL: `https://ACCOUNT.github.io/REPOSITORY/master-study/`

The root homepage's `service-worker.js` and the study app's `master-study/sw.js` are different files with different scopes. Keep both.
