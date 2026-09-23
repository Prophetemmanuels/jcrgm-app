# JCRGM — Shared Preparations & Announcements

**Upload-ready GitHub Pages update · Public connection configured · Database activation still required**

Your project URL and supplied publishable key are already inserted in `supabase-config.js`. The project at `https://yisfzexlbjeoeujvmmno.supabase.co` accepted the key on its authentication settings endpoint. The church tables were not present when checked on 23 September 2026. **Database setup, authentication URL configuration, deployment and first-leader activation are still required.** No church account or live announcement was created by this package.

Website: https://prophetemmanuels.github.io/jcrgm-app/

Use **JCRGM-Upload-Ready-Update.zip**, not the earlier unconfigured package. The ZIP contains update files directly at its root; upload them alongside your existing `index.html`, keeping the subdirectories. This is an update, not a complete backup of every page on your existing site.

## What members will experience

| Person | Public announcements | Shared preparations | Edit / publish | Private registers |
|---|---|---|---|---|
| Signed-out visitor | Read active published notices | No | No | No |
| Signed-in, awaiting approval | Read active published notices | No | No | No |
| Approved member | Read active published notices | Read, print and download | No | No |
| Approved leader | Read and manage notices, including drafts | Read and manage programmes | Yes | Yes |

Installing the app does **not** grant membership or leadership. Everyone must use the updated app connected to the **same Supabase project**. Old downloaded HTML copies will not start synchronising automatically.

Leaders explicitly press **Publish changes** to share checklist edits. An announcement is public only when **Publish publicly** is enabled and its scheduled publication/expiry window permits it. Updates refresh while the page is open and online, using real-time signals plus a 20-second polling fallback. Background tabs may be throttled by the browser.

## Before you upload

1. Back up your GitHub website and existing service worker. Keep your other church pages and assets.
2. If you have unsaved local preparations, download their JSON backup from the old organiser on the device where they were entered.
3. Do **not** put personal backups, private spreadsheets or exported pastoral records into a public GitHub repository. The deployment files contain no church records.

## One-time setup

Open **`shared-setup.html`** for your personalised guide. No public-connection values need editing.

1. **Run `SUPABASE_SETUP.sql` once in your project's SQL Editor.** The guide includes a Copy database script button and the complete SQL.
2. **Configure Authentication → URL Configuration.** Set Site URL to `https://prophetemmanuels.github.io/jcrgm-app/`. Add `https://prophetemmanuels.github.io/jcrgm-app/announcements.html` and `https://prophetemmanuels.github.io/jcrgm-app/programme-preparations.html` as allowed redirect URLs. Keep email/password sign-in and confirmation enabled. Configure production mail/SMTP and test delivery before invitations.
3. **Upload the extracted ZIP contents to the GitHub Pages folder currently containing your index.** Keep `vendor/` and `licenses/` as subdirectories. Do not upload the ZIP itself, and do not delete unrelated pages. Wait for deployment and reload your installed app.
4. **Create and confirm your church-app account** through Announcements → Member / leader sign in → Request access. In the setup guide, enter the exact confirmed sign-in email and click Prepare leader script. Run the generated script in a new Supabase SQL Editor query. Do not upload this personalised script to GitHub.
5. **Approve members and test on two devices.** Leaders use Announcements → Manage member access. Keep ordinary members as members; appoint leaders only when they need private-register and publishing access.

The first person to register is deliberately **not** automatically made an administrator.

## Existing app / service-worker update

The package includes a replacement **`service-worker.js`**. It uses network-first caching for public static website files only. It never caches Supabase, authentication, cross-origin API requests, authorisation-bearing requests, private JSON/API responses or form submissions. The public `manifest.json` is explicitly allowed. Private cloud data is not put into its cache.

Back up your existing worker before replacing it. The current public worker was inspected: its offline-start asset list (home, index, crossover, manifest and touch icon) is preserved in this update. Its cache-first behaviour is changed to network-first so updates are not stuck on old pages. If you add custom worker features later, preserve the safe API/auth exclusions. The supplied worker does not implement push notifications. It does not delete unrelated caches belonging to other websites on your GitHub origin.

After deployment, reopen/reload the installed app so the new worker and pages activate. Test first in a fresh browser profile if an old worker is serving outdated pages. Previously downloaded standalone files must be replaced or users should open the hosted app instead.

The shared pages can retain their public page shell offline after it has been visited, but **cloud checklists require online access**. A previously loaded checklist may remain visible in the current tab as a stale, read-only view; it is not a fresh permission check or an offline shared database.

## First programme and announcement

### Preparations

- Open **programme preparations** from the updated church index.
- Sign in as an approved leader, then choose **New programme** and a template.
- Alternatively, choose **Import old local plan** on the original browser/origin, or import a JSON backup under Downloads. An import creates a **new unpublished draft**, not an overwrite of an existing shared programme.
- Check the programme details, tasks, owners and run sheet. Select **Publish changes**.
- Approved members open the same programme using the programme selector. They can filter, read, print and download the shared checklist, but cannot alter it.
- If two leaders edit the same revision, the later conflicting save is rejected. Download the draft if needed, discard/reload the latest shared version, then deliberately reapply the intended changes. Do not assume a rejected save was published.

### Announcements

- Open **Announcements → New announcement** as a leader.
- Enter a title, category and message. Optionally pin it.
- Enable **Publish publicly** to publish; otherwise it stays a leader-only draft.
- Scheduling and expiry inputs use **Zambia time (UTC+02:00)**.
- Check the result using **Show public view** and a separate signed-out browser.

Public notices are plain text, not rich HTML or attachments. There is no SMS, WhatsApp delivery, background push, native app-store release or closed-app notification service in this update.

## Privacy and access boundaries

- Database row-level access rules enforce membership and leadership; hiding buttons is not the security boundary.
- Shared task titles, owners, notes, programme details, run-sheet entries and safe team assignments are visible to **every approved member**. Do not put confidential counselling, medical, financial or contact details in these shared fields.
- Full private plans are held in a separate leader-only table. The server constructs a restricted shared copy instead of trusting the browser to remove private fields. Members do not receive financial/follow-up/report registers or private team contact fields.
- **All approved leaders** can access the private registers. There are no finer department-specific permissions in this version.
- Programme checklists are never anonymous/public. Published active announcements intentionally are.
- Approval/role changes are checked on subsequent database requests. The interface periodically refreshes identity and clears private displays after detecting revocation or sign-out. Revocation cannot retrieve already printed, copied or downloaded information.
- Use individual accounts, strong passwords and trusted devices. Sign out on shared devices. Personal backups contain sensitive records and need secure storage.
- The public browser key is already configured and may be committed to GitHub; database secrets and service-role keys must never be committed. If a secret is exposed, rotate it in Supabase. Keep the Supabase project-owner account secure.

## Operating limits and maintenance

This is a single-church installation, not a multi-tenant church-hosting service. The current selector displays up to 200 recent programme records, the noticeboard loads up to 200 recent readable announcements, and member management loads up to 500 accounts. Add pagination before exceeding those interface limits. A programme supports up to 600 checklist tasks and a 2.5 MB JSON payload; a notice supports a 180-character title and a 12,000-character body.

Monitor your Supabase project's usage, email delivery, backups and service limits. Provider pricing, quotas and availability are not guaranteed by this package. Establish your database backup/restore procedure before relying on it for important records. Downloaded programme backups are useful but are not a complete backup of member access or announcements.

Increase the cache version in `service-worker.js` when releasing a future static update. Public page files are network-first even before that version is changed. Never change the worker to cache API/auth responses.

## Required live acceptance checks

- Signed-out browser can read a published active notice, but not a draft, future notice or expired notice.
- Signed-out and pending accounts cannot load programme data.
- Approved member can read the checklist and PDF but cannot change a task or publish.
- A new leader publication appears on a second device while it is online.
- Private contacts, financial and pastoral records are absent from member views/downloads.
- Two leaders cannot silently overwrite the same revision.
- Revoking a member blocks subsequent database reads and clears their displayed workspace after identity refresh.
- Sign-up confirmation, password reset and sign-out work using the actual GitHub Pages repository URL.
- Existing installed-app users receive the updated pages; cloud responses never appear in service-worker caches.

## What has been tested

**29 database checks passed** in a local PostgreSQL-compatible engine (PGlite), including RLS, privilege escalation attempts, private-data stripping, public scheduling/expiry, revisions, archive access and last-leader protection.

**32 browser checks passed** using Playwright with a simulated Supabase client, including public/pending/member/leader views, read-only controls, publication, refresh/revocation, conflict handling, mobile layout, configuration generation and shared PDF export. The resulting member PDF was also parsed and checked for private test markers.

These are local development tests, **not** an end-to-end live Supabase/Auth/Realtime/SMTP integration test or a third-party security audit. The supplied public key was additionally checked against your live authentication settings endpoint; that check does not activate the schema or verify sign-up email delivery. Complete the live checks above before church-wide rollout.

## Files

- `index.html` — updated index, preserving the prior navigation and adding Announcements.
- `programme-preparations.html` — connected multi-programme organiser and existing PDF/checklist engine.
- `announcements.html` + `announcements.js` — public board, leader editor and member approval tools.
- `church-platform.js` + `.css` — shared authentication, permission state and interface assets.
- `supabase-config.js` — your configured project URL and public publishable key.
- `vendor/supabase.js` — locally bundled Supabase browser client, version 2.109.0.
- `SUPABASE_SETUP.sql` — run once in a new Supabase project's SQL Editor.
- `FIRST_LEADER.sql` — manual owner-controlled leader bootstrap template.
- `shared-setup.html` — personalised setup guide with SQL copying and a safe first-leader script generator.
- `service-worker.js` — public-static-only network-first worker.
- `licenses/` — included third-party notices.

Your other existing church pages, logo assets and manifest must remain in the repository. They are not deleted or fully re-packaged by this update.
