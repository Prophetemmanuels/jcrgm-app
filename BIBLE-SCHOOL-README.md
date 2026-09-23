# JCRGM Bible Institution — shared student and registrar portal

**Prepared for https://prophetemmanuels.github.io/jcrgm-app/**

The website files are configured for your existing Supabase project, `yisfzexlbjeoeujvmmno`. The school database has **not been installed on your live project by the assistant**. The project owner must run the separate private installer before using the shared school.

## Two separate deliverables — do not mix them

1. **JCRGM-Bible-School-Upload-Ready.zip** — extract and upload its contents to the folder containing your current `index.html` and `JCRGM_Bible_Institution.html`. Preserve its `vendor/` and `licenses/` directories. These files are suitable for your public GitHub repository.
2. **JCRGM-Bible-School-PRIVATE-Setup.sql** — supplied separately. Run it once in Supabase SQL Editor. **NEVER upload this SQL file to GitHub, your website or a public download link. It contains formal assessment answer keys.** It is intentionally absent from the website ZIP and public setup guide.

Back up the existing school HTML and any local student records before replacing the page. This is an additive update: keep your index, church announcements/preparations files, service worker, manifest, other pages and images. It does not replace the church database or change church-leader roles.

## Installation

1. In your existing project's SQL Editor, open a new query. Paste the complete **private school installer** and click Run. Use it once, before the school tables exist. It creates the school tables, checked RPCs, private storage bucket and access policies. It also appoints the confirmed account **pedahzurministries@gmail.com** as the initial school owner. That account must already have completed email confirmation. The result should show its role as `owner` and `active` as `true`. On an error, stop and ask for help; do not weaken permissions or rerun unrelated church scripts.
2. In **Authentication → URL Configuration**, retain the existing Site URL `https://prophetemmanuels.github.io/jcrgm-app/` and your two church redirect entries. **Add this additional allowed redirect:** `https://prophetemmanuels.github.io/jcrgm-app/JCRGM_Bible_Institution.html`.
3. Keep email/password sign-in and email confirmation enabled. Configure production SMTP/email delivery before inviting students; default mail delivery may restrict recipients or be rate-limited. Test confirmation and password reset using the exact deployed school URL. Use strong passwords and protect the Supabase project-owner account.
4. Extract the public website ZIP. Upload its **contents**, not the ZIP or an enclosing folder, beside the current index in the GitHub Pages publishing folder. Commit and wait for Pages deployment. The matching school HTML is replaced, so the existing Bible Institution link continues to work. All public connection settings are already filled in.
5. Reopen the app and refresh the school page. Sign in using **pedahzurministries@gmail.com** and the existing church-app password. You should see **School administration**. You do not need to register as a student to administer the school.
6. Test with a second, ordinary student account before church-wide rollout. Full live acceptance checks are listed below.

The existing network-first service worker from the shared-church update can cache public static school assets, but must never cache Supabase API/auth responses. This ZIP deliberately leaves your current worker and other app files in place. Old downloaded standalone school copies do not synchronise or enforce the new server controls; use the updated hosted page.

## Your selected access model

- **Separate school staff:** church leadership alone does not grant school-admin access. The school owner appoints admins under School administration → Staff. Each appointee must first create and confirm an account. The last active school owner cannot be removed through the app.
- **Immediate admission:** after confirming email and completing registration, a student starts immediately. School access does not depend on church-membership approval. Admins can review registration and suspend access later.
- **Private receipts and assignment files:** PDF, JPG and PNG, up to 5 MB per file. A student's record and uploaded evidence are available only through that student's or an authorised school administrator's permissions.
- **K150 certificate fee:** payment remains manual Airtel Money to **0979 554 970**, account name **Emmanuel Sakala**, with student number and level as reference. The app does not move money or verify transactions with Airtel automatically.

All active school admins can view all students' records, saved coursework drafts, evidence, financial claims, messages and marking decisions. They can mark work, verify fees, authorise exams and issue certificates. Only school owners can appoint/revoke staff. There are no separate teacher/finance roles or dual-approval controls in this version; appoint staff accordingly.

## Student workflow

1. Sign in / create an account and confirm the email.
2. Register with the study covenant and chosen level(s). Receive a server-issued student number. Additional levels can be added from Registration without erasing previous work.
3. Read lessons and save notes. Lesson checks are server-scored; complete them at 50% or above and work in order.
4. Complete all lessons for a course, then work on its 20-question objective assignment and typed essay. **Save draft** regularly. **Check Part A & seal** scores and locks the objective choices. The typed essay and bibliography may still be prepared before **Hand in assignment**.
5. Upload optional supporting PDFs/images under **My files**, linked to the course, before handing in. Files supplement rather than replace the typed essay.
6. Read registrar feedback. A returned paper can be corrected and resubmitted once within 30 days.
7. After passing at least 60% of a level's courses, ask the registrar for an exam permission. Start within its 24-hour window. The exam has a fixed server deadline and saved answers persist between devices. Closing the page does not cancel the sitting. A failed paper allows one retake after marking and 30 days.
8. Claim the certificate payment with the actual transaction reference and attach a receipt to the pending claim. Wait for manual verification and the separate certificate issue decision.
9. View/download the issued certificate as PDF, print it, or export/print the transcript. Enquiries and staff replies are saved under Registrar.

## Registrar workflow

**School administration → Inbox** gathers submitted assignments, payment claims, exams awaiting marking and unread student enquiries across the school. Review the linked student record. Replying to an enquiry marks received student messages read; there is also a manual read button.

**Students** provides paginated search by name, student number or email; registration details; active/suspended status; saved work; files; transcripts; exam permissions and decisions; payment approvals; and certificate records. Each page shows 50 students. Export the current student-register page or the full paginated payment ledger as private CSV files.

- **Mark assignments:** read the paper and evidence, enter each rubric mark, and give feedback. The server calculates the weighted result. A course passes only when it meets its level's final threshold and the objective score is at least 50%.
- **Return a paper:** add required corrections. This clears the objective seal and prior pass, allows one resubmission, and may revoke a previously issued certificate whose eligibility is no longer valid.
- **Payment verification:** compare the reference, date, amount, sender and receipt against the actual church Airtel Money account. Tick that the received funds were checked and enter an audit note. Duplicate transaction references are rejected across students. Receipts do not automatically prove payment. Reviewed evidence is not replaceable by the student.
- **Exams:** authorise a 24-hour window to start. The usual sitting is 40 questions and 60 minutes. The server fixes its deadline. At expiry it seals the last saved work, not late changes. Staff grade the written answer; it needs at least 250 words and a mark of 50%. Objective pass thresholds are 60%, 65% for masters/prophetic and 70% for doctoral levels.
- **Certificates:** server checks require active registration, every course passed, a passed marked level exam and a verified K150 claim. An admin then issues the numbered certificate. Reversing an eligibility decision revokes affected certificates automatically. Admins can also revoke with a reason or recheck and reinstate revoked certificates. Existing valid issues are not silently renumbered.
- **Notices:** publish/unpublish school notices for registered students. The separate church Announcements board remains public and unchanged.
- **Audit:** the last 200 events are displayed; the complete log is retained in the database. Marking and administrative decision details are recorded. Evidence is not silently overwritten.

The former browser staff code, browser invigilator code, direct `unlock` helper and local payment flags have no authority in the shared system. Database policies and checked server functions, not hidden buttons, enforce permissions.

## Preservation and deliberate changes

The original 9 levels, 27 courses, 31 supplied lessons, 540 objective assignment questions, assignment specifications, rubrics, departmental practice papers, logos, reading lists and term table are retained. Six colour themes are included. Original reading-list bibliographic details should be verified before purchase/citation.

The old file had conflicting seven-day and thirty-day retake wording. This version consistently uses the handbook's **30-day** failed-exam retake rule. A server-issued staff permission replaces the exposed invigilator code. The registrar must approve the exam's written answer instead of relying only on browser objective marking.

Calendar dates are informational and notices may update them. Intended study duration, attendance, originality, bibliography authenticity, supervision, research/oral defence and pastoral suitability still need human oversight. The software does not prove learning time or prevent all cheating.

Formal assignment answer indexes are absent from the public curriculum file and stored in a restricted database schema. **The former offline HTML already contained those keys. They may remain in previously downloaded files or Git history. Do not treat the inherited question bank as secret; replace/rotate assessment items before relying on secrecy for high-stakes examinations.** Lesson and departmental practice answers remain public formative teaching material. Preserve existing assessment versions when making future changes.

## Old offline records

Under **My record**, a signed-in registered student can download an old browser backup or submit it for staff review. A JSON backup from another device can also be uploaded for review. This is an explicit operation; the app never silently uploads old local records.

Only import records belonging to the correct student. The imported record remains **unverified evidence**. Its local marks, fee flags and certificate seals are not automatically accepted. Staff can inspect it and, after checking original school evidence, record reviewed prior-learning credit with rubric marks and a reason. Fees and exams still follow the new verified workflows; imported exam passes are not automatically credited.

Old browser records are not deleted automatically. After confirming migration and secure backup, arrange appropriate removal from shared devices. Clearing browser data before backing up the old school may permanently lose local records.

## Privacy, reliability and maintenance

- Cloud saves require internet. Assignment/lesson drafts are shared only after Save. Exam changes auto-save after a short pause and periodically while online; also use Save answers now. Keep the tab open during a connection failure. Unsaved in-memory text can be lost if the device closes the tab. Only authentication/session data and the colour theme are deliberately persisted by the new client; private learning records are not automatically cached to browser disk.
- Changes and permission status refresh approximately every 20 seconds while the page is open. Background tabs may be throttled. There is no background push, SMS, WhatsApp or automatic grading/payment email service.
- Revision checks reject stale saves rather than silently overwriting another device or administrator. Copy a conflicting draft, refresh and deliberately reapply the intended changes. Administrative eligibility decisions are serialised per student in the database.
- The private bucket is `jcrgm-school-private`. Upload paths are generated, evidence is immutable to browser clients, and restrictive policies protect it even if unrelated buckets have broad access policies. A student is limited to 200 reserved files and 100 MB in total, including unfinished reservations. Five MB is the individual file limit. Project limits may be lower; monitor actual storage usage.
- Files are not virus-scanned by this implementation. Only expected PDF/JPG/PNG evidence should be opened. MIME/size restrictions are not a malware guarantee. Rejected or orphaned evidence and retention cleanup require the project owner's controlled storage/database maintenance; deletion is deliberately not a student button.
- Private files open through signed URLs valid for 60 seconds. Anyone given such a link can use it until expiry. Revocation blocks subsequent reads/signing, but cannot retrieve already printed, downloaded, copied or still-valid signed-link content.
- The certificate database record is authoritative. Browser-generated PDFs are not digitally signed. A person can alter a downloaded document; verify a certificate number with the registrar. There is no anonymous public directory exposing students' educational records.
- Use individual accounts, strong passwords, appropriate consent and retention rules, and trusted devices. Sign out on shared devices. Secure exported registers, transcripts, legacy records and receipts. Set up database **and storage-object** backups and test restoration.
- Messages show the latest 200 per student; notices and audit interfaces have stated recent-item limits. Inbox/register are paginated. Avoid treating an on-screen recent list as a complete historical archive.
- Provider quotas, mail delivery, pricing and availability are not guaranteed by this package. Monitor usage and abuse, apply appropriate account restrictions, and arrange a professional review before high-stakes or large-scale deployment.

## Required live checks before inviting students

- Confirm the private installer succeeded and only the intended first owner has school-admin access.
- Verify email confirmation/reset links return to the exact school page, with production mail delivery configured.
- Register a second account and confirm immediate student access but no admin navigation or admin RPC access.
- Save lesson work on one device and load it on another.
- Submit an assignment; mark it as admin; confirm the student receives the decision and cannot alter sealed work.
- Submit a K150 claim and a real private receipt. Confirm another student cannot read it or obtain a signed URL. Verify/reject it manually and confirm the result on the student's device.
- Test an authorised exam sitting, saved answers across refresh, server expiry and the written-answer marking requirement.
- Confirm payment alone cannot issue a certificate; issue only after all academic requirements are satisfied. Check PDF printing and registry details.
- Revoke a test admin/student and confirm subsequent private reads and file signing are denied, with the interface clearing after refresh.
- Check the installed app is using updated pages and that no Supabase/auth/student API responses appear in service-worker caches.

## Development testing

**45 database checks passed** in a local PostgreSQL-compatible PGlite engine, including isolation, immediate admission, separate staff roles, rejected role escalation, authoritative marking, revision conflicts, resubmission limits, exam deadlines, duplicate payments, private storage policies (including broad-policy interference), certificate eligibility/revocation, last-owner protection and suspended-account access.

**21 browser checks passed** with Playwright against that local database engine, using simulated authentication and storage transport. These exercised registration, lesson progress, sealed assignment submission, a second device, private receipt upload/finalisation, registrar inbox, marking, payment review, mobile layout, account switching/sign-out, transcript CSV and genuine certificate PDF download. The PDF text was also parsed and inspected.

These tests are **not** a hosted Supabase Auth/PostgREST/Storage/SMTP integration test or an independent security audit. No live school records were created during testing. Complete the acceptance checks above after installation.

## Website files

- `JCRGM_Bible_Institution.html` — replaces the old school page at its existing link.
- `school-app.js`, `school.css` — shared student and registrar interface.
- `school-curriculum.js` — public teaching data and formal question wording/options; no formal BANK answer indexes.
- `supabase-config.js` — your existing project URL and public publishable key, already filled in.
- `vendor/supabase.js` — Supabase JS 2.109.0, locally hosted.
- `vendor/jspdf.school.min.js` — jsPDF 3.0.3 for certificate PDF output.
- `school-setup.html` — public installation/help guide; contains no private answer keys.
- `licenses/` — third-party notices.

Keep the private installer and maintenance source outside your public repository. Never add a service-role key, secret API key, database password or GitHub token to any browser file.
