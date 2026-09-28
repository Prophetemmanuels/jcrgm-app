/* ============================================================================
   JCRGM — COMPASSION & WELFARE ENGINE   (jcrgm-config.js)
   ----------------------------------------------------------------------------
   Jesus Christ Redeems Global Ministries
   Support Team registration + public assistance applications.

   ██  SINGLE SOURCE OF TRUTH  ██████████████████████████████████████████████
   Edit ONLY this file to configure the whole welfare system.
   Every page (index.html button, support portal, status lookup) reads it.
   Follows the same pattern as CHURCH_CONFIG in index.html.
   ==========================================================================*/

var JCRGM = (function () {
  "use strict";

  /* ==========================================================================
     1. CHURCH IDENTITY — change these and the whole portal rebrands
     ========================================================================== */
  var CONFIG = {
    version: "1.0.0",

    fullName: "Jesus Christ Redeems Global Ministries",
    shortName: "JCRGM",
    teamName: "JCRGM Support Team",
    unitName: "Compassion & Welfare Ministry",
    motto: "Together in Faith · Stronger in Purpose",
    tagline: "Caring for the ones Christ died for",

    // Office / helpdesk contacts
    phone: "0979554970",
    whatsapp: "260979554970",          // country code + number, digits only
    email: "pedahzurministries@gmail.com",
    mapLink: "https://maps.app.goo.gl/t8LcZowDWVmsAiJu8",
    mapVenueLabel: "JCRGM CHURCH",
    postalAddress: "P.O. Box 10101, Lusaka, Zambia",
    officeHours: "Mon–Fri 09:00–16:00 · Sunday after service",

    // Scripture shown on the public side
    verseText: "“Religion that God our Father accepts as pure and faultless is this: to look after orphans and widows in their distress.”",
    verseRef: "James 1:27",
    verseTextAlt: "“Whoever is kind to the poor lends to the LORD, and he will reward them for what they have done.”",
    verseRefAlt: "Proverbs 19:17",

    /* ---- DESK ACCESS -------------------------------------------------------
       The register holds confidential welfare data, so opening it takes two
       things, in this order:

         1. A signed-in, APPROVED church account (window.Church, loaded by
            church-platform.js) whose role is one of deskRoles - the same
            accounts that already gate Announcements and programme prep.
            This is the real boundary; the database repeats it with row-level
            security so a modified page cannot get around it.
         2. The Support Team code below - which stops any signed-in member
            from wandering into other people's welfare files.

       The code is stored only as SHA-256(PEPPER + code), never as the word.
       Rotate it with:
         node -e "const c=require('crypto');console.log(c.createHash('sha256').update('jcrgm-welfare-v1::NEWPASS').digest('hex'))"
       and paste the result into adminPasswordHash.

       When church-platform.js is absent (opening this file straight off the
       phone, or before the platform is connected) the code alone is the gate,
       so the desk is never unreachable.
    ---------------------------------------------------------------------- */
    adminPasswordPepper: "jcrgm-welfare-v1",
    adminPasswordHash: "0dbe76dc0430264dde5f9a96c14f2d72ce0ad5fe238c853ed456cff8c90b90ef", // = "JCRGMST" (real SHA-256)
    // Phones open the app over file:// or an in-app WebView where SubtleCrypto
    // is unavailable, so the checksum loop below is accepted as well.
    adminPasswordHashFallback: "811c9dc594a0b714c2b2ae35674117e794a0b714d67cde8d674117e7cb4b41b6",
    adminSessionMinutes: 40,           // auto lock-out after inactivity
    maxPasswordAttempts: 6,            // then a cool-down
    requireChurchAuth: true,           // an approved church account is needed as well
    deskRoles: ["welfare", "diaconia", "leader", "pastor", "administrator"],
    allowMembersFullAccess: false,     // true = any approved member may review cases
    listLimit: 500,                    // stay inside the platform's stated interface limits

    /* ---- SUPABASE ----------------------------------------------------------
       Nothing to paste here. The church app already ships supabase-config.js
       (window.JCRGM_SUPABASE) and vendor/supabase.js, and index.html loads
       them on every page - so this portal reads the SAME project as
       Announcements and membership. Run supabase-schema.sql in that project
       once and the welfare register shares the church's accounts, roles and
       realtime.

       Fill these two in only if you deliberately want a separate database for
       welfare; they then take priority over the church config. With neither
       configured the portal still works: records stay on the phone and queue.
    ---------------------------------------------------------------------- */
    supabaseUrl: "",                   /* normally blank - see supabase-config.js */
    supabaseAnonKey: "",               /* normally blank - see supabase-config.js */
    tableName: "jcrgm_welfare_cases",  // must match the SQL schema
    rpcInsert: "jcrgm_create_case",    // atomic insert, returns official ref no.
    rpcLookup: "jcrgm_lookup_case",    // safe public lookup by ref + phone
    refPrefix: "JCRGM",                // reference numbers: JCRGM-2026-4831-K
    currencyDefault: "ZMW",
    currencyOptions: [
      { code: "ZMW", label: "ZMW — Kwacha" },
      { code: "USD", label: "USD — US Dollar" },
      { code: "EUR", label: "EUR — Euro" },
      { code: "GBP", label: "GBP — Pound" }
    ],
    disbursementMethods: ["Mobile money (MTN/Airtel/Zamtel)", "Bank transfer", "Cash — handed by Support Team", "Paid direct to institution", "Goods / in-kind"],

    /* ---- WELFARE CATEGORIES — every case must pick one ------------------ */
    categories: [
      { id: "education",     label: "Education & School Fees",  ico: "🎓", note: "Fees, uniforms, exercise books, exams, tertiary" },
      { id: "medical",       label: "Medical & Healthcare",     ico: "🏥", note: "Clinic bills, drugs, surgery, transport to hospital" },
      { id: "food",          label: "Food & Daily Sustenance",  ico: "🍲", note: "Meal support, maize meal, grocery hampers" },
      { id: "shelter",       label: "Shelter & Utilities",      ico: "🏠", note: "Rent, water and electricity arrears, emergency housing" },
      { id: "burial",        label: "Bereavement & Funeral",    ico: "🕊", note: "Funeral support for bereaved families" },
      { id: "orphan",        label: "Orphan & Child Care",      ico: "🧒", note: "Vulnerable children, guardians, school sponsorship" },
      { id: "widow",         label: "Widows & Widowers",        ico: "👵", note: "Long-term sustainment of widows and widowers" },
      { id: "disability",    label: "Disability Support",       ico: "♿", note: "Assistive devices, care, mobility" },
      { id: "startups",      label: "Empowerment & Start-ups",  ico: "🛠", note: "Seeds, tools, sewing machine, trading float, training" },
      { id: "transport",     label: "Transport & Travel",       ico: "🚌", note: "Fare home, travel to hospital or school" },
      { id: "spiritual",     label: "Evangelism & Discipleship",ico: "📖", note: "Literature, Bible school fees, mission support" },
      { id: "other",         label: "Other (describe below)",   ico: "🤝", note: "Any genuine need not listed" }
    ],

    urgency: [
      { id: "critical", label: "Critical — same day", tone: "danger" },
      { id: "high",     label: "Urgent — within 72 hours", tone: "warn" },
      { id: "normal",   label: "Standard — within 2 weeks", tone: "ok" },
      { id: "planned",  label: "Planned / recurring", tone: "info" }
    ],

    vulnerability: [
      "Orphan / vulnerable child", "Child-headed household", "Expectant or nursing mother",
      " elderly (60+)", "Person with a disability", "Chronically ill", "Unemployed",
      "Survivor of abuse or violence", "Refugee / displaced", "Youth in school", "Other"
    ],

    genders: ["Male", "Female", "Prefer not to say"],

    provinces: [
      "Lusaka", "Copperbelt", "Central", "Southern", "Eastern", "Luapula", "Northern",
      "Muchinga", "Western", "North-Western", "Outside Zambia (diaspora)"
    ],

    /* ---- WORKFLOW — the lifecycle every case moves through -------------- */
    statuses: [
      { id: "submitted",  label: "Submitted",         color: "#64748b", desc: "Received at the welfare desk, awaiting first review." },
      { id: "reviewing",  label: "Under Review",      color: "#3b5bb5", desc: "A Support Team member is verifying the details." },
      { id: "visit",      label: "Home Visit Set",    color: "#7d3c98", desc: "A field visit or reference call is scheduled." },
      { id: "approved",   label: "Approved",          color: "#1e8e4f", desc: "Approved — awaiting disbursement." },
      { id: "disbursed",  label: "Assistance Given",  color: "#c9960a", desc: "Funds or goods released and receipted." },
      { id: "declined",   label: "Not Approved",      color: "#b81e3f", desc: "After review, the case could not be supported." },
      { id: "closed",     label: "Closed — God Glorified", color: "#0e7c86", desc: "Completed and followed up." }
    ]
  };

  /* ==========================================================================
     2. PURE LOGIC — no DOM.  Safe to unit-test in Node.
     ========================================================================== */

  var W = {}; // utilities namespace

  /* ---------- 2.1 Reference numbers: JCRGM-YYYY-NNNN-C (C = check letter) -- */
  /* I and O are left out so a reference read aloud off a WhatsApp screen
     cannot be mis-typed. The string is therefore 24 letters long, and every
     index must be taken modulo that length - not modulo 26, which used to
     hand back charAt(24)/charAt(25) === "" and mint references ending in a
     bare dash ("JCRGM-2026-8010-"). jcrgm_next_ref() in supabase-schema.sql
     mirrors this exact length-based rule; change one, change both. */
  var REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";

  W.refCheckLetter = function (body) {
    var sum = 0;
    for (var i = 0; i < body.length; i++) sum = (sum * 31 + body.charCodeAt(i)) >>> 0;
    return REF_ALPHABET.charAt(sum % REF_ALPHABET.length);  // 24 letters - must match jcrgm_next_ref()
  };

  W.buildRef = function (year, seq4) {
    var body = CONFIG.refPrefix + "-" + year + "-" + ("000" + seq4).slice(-4);
    return body + "-" + W.refCheckLetter(body);
  };

  W.refRegex = function () {
    return new RegExp("^" + CONFIG.refPrefix + "-(20\\d{2})-(\\d{4})(?:-([A-NP-Z]))$", "i");
  };

  /** Returns {ok, year, seq, normalized, checksumValid?, reason?} */
  W.parseRef = function (raw) {
    var s = String(raw || "").trim().toUpperCase().replace(/\s+/g, "").replace(/\./g, "");
    var m = s.match(W.refRegex());
    if (!m) return { ok: false, reason: "That is not a valid JCRGM reference. The format is " + CONFIG.refPrefix + "-2026-1234-K." };
    var out = { ok: true, year: +m[1], seq: +m[2], normalized: s };
    if (m[3]) {
      var body = s.slice(0, s.lastIndexOf("-"));
      out.checksumValid = W.refCheckLetter(body) === m[3].toUpperCase();
      if (!out.checksumValid) out.reason = "That last letter does not match the rest of the number — please re-copy the whole reference.";
    }
    return out;
  };

  /** Collision-resistant local reference used before the server confirms one. */
  W.temporaryRef = function () {
    var y = new Date().getFullYear();
    var n = Math.floor(Math.random() * 9000) + 1000;
    return W.buildRef(y, n);
  };

  /* ---------- 2.2 Money / dates ------------------------------------------- */
  W.formatMoney = function (amount, currency) {
    var n = Number(amount);
    if (!isFinite(n) || isNaN(n)) return "—";
    var sym = { ZMW: "K", USD: "$", EUR: "€", GBP: "£" }[currency || CONFIG.currencyDefault];
    var body = n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    currency = currency || CONFIG.currencyDefault;
    return (currency === "ZMW" ? sym + body : currency + " " + body);
  };

  W.todayISO = function () { return new Date().toISOString().slice(0, 10); };

  W.daysSince = function (iso) {
    if (!iso) return null;
    var t = Date.parse(iso);
    if (isNaN(t)) return null;
    return Math.floor((Date.now() - t) / 86400000);
  };

  W.ageFromDob = function (dob) {
    if (!dob) return null;
    var d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    var now = new Date(), a = now.getFullYear() - d.getFullYear();
    var mo = now.getMonth() - d.getMonth();
    if (mo < 0 || (mo === 0 && now.getDate() < d.getDate())) a--;
    return a >= 0 && a < 130 ? a : null;
  };

  W.isMinor = function (dob) { var a = W.ageFromDob(dob); return a !== null && a < 18; };

  /* ---------- 2.3 Status helpers ------------------------------------------ */
  W.status = function (id) {
    for (var i = 0; i < CONFIG.statuses.length; i++) if (CONFIG.statuses[i].id === id) return CONFIG.statuses[i];
    return CONFIG.statuses[0];
  };
  W.category = function (id) {
    for (var i = 0; i < CONFIG.categories.length; i++) if (CONFIG.categories[i].id === id) return CONFIG.categories[i];
    return { id: "other", label: "Unspecified", ico: "🤝", note: "" };
  };
  W.isActive = function (r) { return r.status === "approved" || r.status === "disbursed"; };
  W.isAwaitingAdmin = function (r) { return ["submitted", "reviewing", "visit"].indexOf(r.status) >= 0; };
  /** Public wording for an applicant — softer than internal labels. */
  W.publicStatusText = function (r) {
    var map = {
      submitted: "We have received your request and it is in the queue.",
      reviewing: "A member of the Support Team is prayerfully reviewing your case.",
      visit: "A home visit or reference call has been scheduled for you.",
      approved: "Your request has been APPROVED. The Support Team will contact you with the next step.",
      disbursed: "Assistance has been released. Please keep your reference number for records.",
      declined: "After careful review the committee could not approve this request at this time. You are welcome to re-apply.",
      closed: "This case has been closed. Thank you for trusting JCRGM."
    };
    return map[r.status] || map.submitted;
  };

  /* ---------- 2.4 Phone number normalisation (Zambia-friendly) ------------- */
  W.normalisePhone = function (raw) {
    var s = String(raw || "").replace(/[^\d+]/g, "");
    if (!s) return "";
    if (s.charAt(0) === "+") s = s.slice(1);
    if (s.charAt(0) === "0") s = "260" + s.slice(1);          // 097... -> 26097...
    else if (s.charAt(0) === "9" && s.length === 9) s = "260" + s; // 97xxxxxxx
    return s;
  };
  W.isValidPhone = function (raw) { var s = W.normalisePhone(raw); return /^\d{9,15}$/.test(s); };
  W.isValidEmail = function (e) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(e || "").trim()); };
  /** Last 4 digits — the light-touch secret for public status lookups. */
  W.phoneTail = function (raw) { var s = W.normalisePhone(raw); return s.length >= 4 ? s.slice(-4) : ""; };

  W.nrc = function (raw) { return String(raw || "").toUpperCase().replace(/\s+/g, ""); };
  W.isValidNrc = function (raw) {
    var s = String(raw || "").replace(/\s+/g, "").toUpperCase();
    if (!s) return false;
    if (/^\d{6,10}[\/-]\d{1,2}[\/-]\d{1,2}[A-Z]{0,3}$/.test(s)) return true; // 123456/10/1 or 123456-10-1
    if (/^\d{7,12}[A-Z]{0,3}$/.test(s)) return true;                        // legacy run of digits
    return false;
  };

  /* ---------- 2.5 Validation (declarative, shared by both forms) ---------- */
  /**
   * values  — object of field->value
   * fields  — array of field descriptors (see SPONSOR_FORM / APPLY_FORM)
   * returns { errors: {fieldId: msg}, firstBad: fieldId|null, ok: bool }
   */
  W.validate = function (values, fields) {
    values = values || {};
    var errors = {};
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.adminOnly) continue;                       // staff-only: never applicant-required
      var v = values[f.id];
      var isCheck = f.type === "checkbox";
      var on = v === true || v === "true" || v === "on";
      var str = isCheck ? (on ? "1" : "") : String(v == null ? "" : v).trim();
      if (f.required && !str) { errors[f.id] = "Please " + (f.type === "checkbox" ? "tick this box" : "fill in " + (f.label || "this field")) + "."; continue; }
      if (!str) continue;
      if (f.type === "email" && !W.isValidEmail(str)) errors[f.id] = "Please enter a valid email address, e.g. name@example.com.";
      else if (f.type === "tel" && !W.isValidPhone(str)) errors[f.id] = "Please enter a reachable number, e.g. 0971 234 567.";
      else if (f.id === "beneficiary_nrc" && !W.isValidNrc(str)) errors[f.id] = "NRC should look like 123456/10/1.";
      else if (f.type === "date" && isNaN(Date.parse(str))) errors[f.id] = "Please enter a real date.";
      else if (f.numeric && (isNaN(Number(str)) || Number(str) < 0)) errors[f.id] = "Please enter a positive number.";
      else if (f.numeric && f.max !== undefined && Number(str) > f.max) errors[f.id] = "Please enter " + f.max + " or less.";
      else if (f.maxLength && str.length > f.maxLength) errors[f.id] = "Please keep this to " + f.maxLength + " characters or fewer.";
      else if (f.minWords && str.split(/\s+/).filter(Boolean).length < f.minWords) errors[f.id] = "Please write at least " + f.minWords + " words — the team needs enough detail to help you properly.";
    }
    var firstBad = null;
    for (var j = 0; j < fields.length; j++) { if (errors[fields[j].id]) { firstBad = fields[j].id; break; } }
    return { errors: errors, firstBad: firstBad, ok: !firstBad, count: Object.keys(errors).length };
  };

  /* ---------- 2.6 Records -------------------------------------------------- */
  var RECORD_KEYS = [
    "id", "kind", "ref_no", "created_at", "updated_at", "created_by",
    "beneficiary_name", "preferred_name", "dob", "gender", "nationality", "beneficiary_nrc",
    "orphan_status", "phone", "alt_phone", "email",
    "province", "city", "compound", "physical_address", "nearest_landmark",
    "marital_status", "household_size", "dependants", "employment_status",
    "congregation", "member_since", "referenced_by",
    "sponsor_name", "sponsor_phone", "sponsor_email", "sponsor_membership_no", "sponsor_relation",
    "sponsor_pledge_total", "sponsor_pledge_monthly", "currency", "support_type", "period_months",
    "start_date", "end_date", "disbursement_method", "disbursement_account",
    "category", "urgency", "amount_requested", "need_description", "vulnerability",
    "institution_name", "institution_contact", "facility_name", "orsan_number", "bank_name", "account_number",
    "documents", "consent_data", "consent_minor", "consent_photo", "declaration",
    "status", "priority", "assigned_to", "admin_notes", "decision_notes",
    "decision_date", "review_date", "disbursed_amount", "disbursed_date", "receipt_ref"
  ];

  W.blankRecord = function (kind) {
    var r = { id: W.uid(), kind: kind, status: "submitted", currency: CONFIG.currencyDefault, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    for (var i = 0; i < RECORD_KEYS.length; i++) if (!(RECORD_KEYS[i] in r)) r[RECORD_KEYS[i]] = "";
    r.vulnerability = []; r.documents = []; r.priority = "normal"; r.period_months = 1;
    return r;
  };

  W.uid = function () {
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  };

  W.sanitise = function (input) {
    return String(input == null ? "" : input).replace(/[<>]/g, "").trim();
  };

  /** Trim + escape everything a user typed before it touches storage or DOM. */
  W.validIso = function (v) {
    var t = Date.parse(v);
    return v && !isNaN(t) ? new Date(t).toISOString() : "";
  };

  W.cleanRecord = function (raw) {
    raw = raw || {};
    // Identity + audit columns must survive cleaning or nothing can be found
    // again after it is written.  Underscore-prefixed keys are local-only
    // bookkeeping (_offline, _synced, _syncError) and ride along as-is.
    var out = {};
    var k;
    for (k in raw) {
      if (!Object.prototype.hasOwnProperty.call(raw, k)) continue;
      if (k.charAt(0) === "_" && k !== "_id") out[k] = raw[k];
    }
    out.id = W.sanitise(raw.id || "").slice(0, 64) || W.uid();
    out.ref_no = String(raw.ref_no || "").trim().toUpperCase().replace(/[^A-Z0-9./\\-]/g, "").slice(0, 32);
    out.kind = raw.kind === "sponsorship" ? "sponsorship" : "application";
    out.created_at = W.validIso(raw.created_at) || new Date().toISOString();
    out.updated_at = W.validIso(raw.updated_at) || out.created_at;
    for (var i = 0; i < RECORD_KEYS.length; i++) {
      k = RECORD_KEYS[i];
      var v = raw[k];
      if (k === "id" || k === "ref_no" || k === "kind" || k === "created_at" || k === "updated_at") continue;
      if (k === "vulnerability") { out[k] = Array.isArray(v) ? v.map(W.sanitise).slice(0, 12) : []; continue; }
      if (k === "documents") { out[k] = Array.isArray(v) ? v.map(W.sanitise).slice(0, 12) : []; continue; }
      if (k === "period_months") { var pm = Number(v); out[k] = isFinite(pm) && pm > 0 ? Math.min(Math.round(pm), 600) : 1; continue; }
      if (k === "household_size" || k === "dependants") { var n = Number(v); out[k] = isFinite(n) && n >= 0 ? Math.min(Math.round(n), 99) : ""; continue; }
      if (k === "phone" || k === "alt_phone" || k === "institution_contact" || k === "sponsor_phone") {
        out[k] = W.isValidPhone(v) ? W.normalisePhone(v) : W.sanitise(v).slice(0, 32); continue;
      }
      if (k === "amount_requested" || k === "sponsor_pledge_total" || k === "sponsor_pledge_monthly" || k === "disbursed_amount") {
        var m = Number(v); out[k] = isFinite(m) && m >= 0 ? Math.round(m * 100) / 100 : ""; continue;
      }
      if (k === "consent_data" || k === "consent_minor" || k === "consent_photo" || k === "declaration") { out[k] = (v === true || v === "true" || v === "on"); continue; }
      if (typeof v === "string") { out[k] = W.sanitise(v).slice(0, 2000); continue; }
      out[k] = v == null ? "" : W.sanitise(v);
    }
    return out;
  };

  /* ---------- 2.7 CSV export (Excel-safe) ---------------------------------- */
  W.toCSV = function (records, columns) {
    var cols = columns || RECORD_KEYS;
    function esc(x) {
      var s = x === null || x === undefined ? "" : String(Array.isArray(x) ? x.join("; ") : x);
      if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
      return s;
    }
    var lines = [cols.map(esc).join(",")];
    for (var i = 0; i < records.length; i++) {
      var row = [];
      for (var j = 0; j < cols.length; j++) {
        if (cols[j] === "_category") row.push(W.category(records[i].category).label);
        else if (cols[j] === "_status") row.push(W.status(records[i].status).label);
        else if (cols[j] === "_age") row.push(W.ageFromDob(records[i].dob) || "");
        else row.push(records[i][cols[j]]);
      }
      lines.push(row.map(esc).join(","));
    }
    return "\uFEFF" + lines.join("\r\n"); // BOM so Excel opens Zambian text correctly
  };

  /* ---------- 2.8 Reporting roll-ups --------------------------------------- */
  W.summarise = function (records) {
    var s = {
      total: records.length, sponsored: 0, applied: 0, awaiting: 0, active: 0,
      committedMonthly: 0, requestedTotal: 0, disbursedTotal: 0, minors: 0, critical: 0,
      byCategory: {}, byStatus: {}
    };
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.kind === "sponsorship") s.sponsored++; else s.applied++;
      if (W.isAwaitingAdmin(r)) s.awaiting++;
      if (W.isActive(r)) s.active++;
      if (W.isMinor(r.dob)) s.minors++;
      if (r.urgency === "critical") s.critical++;
      s.committedMonthly += Number(r.sponsor_pledge_monthly) || 0;
      s.requestedTotal += Number(r.amount_requested) || 0;
      s.disbursedTotal += Number(r.disbursed_amount) || 0;
      var c = W.category(r.category).label; s.byCategory[c] = (s.byCategory[c] || 0) + 1;
      var st = W.status(r.status).label; s.byStatus[st] = (s.byStatus[st] || 0) + 1;
    }
    return s;
  };

  /* ---------- 2.9 Search / filter / sort ----------------------------------- */
  W.filterRecords = function (records, opts) {
    opts = opts || {};
    var q = String(opts.query || "").trim().toLowerCase();
    var out = [];
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (opts.kind && r.kind !== opts.kind) continue;
      if (opts.status && r.status !== opts.status) continue;
      if (opts.category && r.category !== opts.category) continue;
      if (opts.awaitingOnly && !W.isAwaitingAdmin(r)) continue;
      if (q) {
        var hay = [r.ref_no, r.beneficiary_name, r.sponsor_name, r.compound, r.city, r.phone, r.institution_name, r.facility_name, r.beneficiary_nrc].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) continue;
      }
      out.push(r);
    }
    out.sort(function (a, b) {
      if (opts.sort === "oldest") return String(a.created_at).localeCompare(String(b.created_at));
      if (opts.sort === "amount") return (Number(b.amount_requested) || 0) - (Number(a.amount_requested) || 0);
      return String(b.created_at).localeCompare(String(a.created_at));
    });
    return out;
  };

  /* ---------- 2.10 Password (salted SHA-256 with a JS fallback) ------------ */
  W.sha256 = function (msg) {
    if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg)).then(function (buf) {
        var b = new Uint8Array(buf), s = "";
        for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? "0" : "") + b[i].toString(16);
        return s;
      });
    }
    return Promise.resolve(W.sha256Fallback(msg)); // file:// or old WebView
  };

  /** Deterministic 64-char fallback (not crypto-grade — only used where
      SubtleCrypto is unavailable, e.g. opened straight off the phone's file
      system, and always paired with the RLS policies on the database). */
  W.sha256Fallback = function (s) {
    var h1 = 0x811c9dc5, h2 = 0xc2b2ae35, out = "";
    for (var r = 0; r < 8; r++) {
      var mix = [h1, h2];
      for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i) + r * 131;
        h1 = ((h1 ^ c) * 0x01000193) >>> 0;
        h2 = ((h2 + c) * 0x85ebca6b >>> 0) ^ (h1 >>> 7);
        h1 = ((h1 << 5) | (h1 >>> 27)) >>> 0;
        h2 = (h2 + ((h1 & 0xffff) * (h2 & 0xffff))) >>> 0;
      }
      out += ("00000000" + mix[0].toString(16)).slice(-8) + ("00000000" + h1.toString(16)).slice(-8) +
             ("00000000" + mix[1].toString(16)).slice(-8) + ("00000000" + h2.toString(16)).slice(-8);
    }
    return out.slice(0, 64);
  };

  W.checkAdminPassword = function (pw) {
    var entered = String(pw || "");
    if (!entered) return Promise.resolve(false);
    var canon = CONFIG.adminPasswordPepper + "::" + entered;
    return W.sha256(canon).then(function (hex) {
      if (hex === CONFIG.adminPasswordHash) return true;
      // SubtleCrypto is missing on file:// and some WebViews -> accept the
      // matching fallback digest so the desk still works offline.
      if (!W.cryptoAvailable()) return W.sha256Fallback(canon) === CONFIG.adminPasswordHashFallback;
      return false;
    });
  };

  W.cryptoAvailable = function () {
    return typeof crypto !== "undefined" && !!crypto.subtle && !!crypto.subtle.digest;
  };

  /* ==========================================================================
     3. SUPABASE LAYER — graceful when unconfigured or offline
     ========================================================================== */
  var S = {};
  var client = null;

  /** Where the connection comes from: an override here, otherwise the church
      app's own supabase-config.js (window.JCRGM_SUPABASE), which index.html
      already loads on every page. */
  S.settings = function () {
    var g = (typeof window !== "undefined" && window.JCRGM_SUPABASE) || null;
    if (CONFIG.supabaseUrl && CONFIG.supabaseAnonKey)
      return { url: CONFIG.supabaseUrl, key: CONFIG.supabaseAnonKey, source: "jcrgm-config.js (override)" };
    if (g && g.url && g.key)
      return { url: g.url, key: g.key, source: "supabase-config.js - shared church project" };
    return null;
  };

  /* Same rule church-platform.js uses: https + .supabase.co, publishable or
     anon keys only, and a flat refusal of anything secret. */
  S.validKey = function (key) {
    if (!key || key.indexOf("YOUR_") >= 0) return false;
    if (/^sb_secret_/i.test(key)) return false;
    if (/^sb_publishable_/i.test(key)) return true;
    try {
      var payload = JSON.parse(atob(String(key).split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.role === "service_role") return false;
      return payload.role === "anon";
    } catch (e) { return false; }
  };

  S.validUrl = function (url) {
    // "YOUR-PROJECT.supabase.co" is a real host, so placeholder text has to
    // be caught by name as well or a half-filled config looks live and every
    // write fails in a way the phone cannot retry.
    if (!url || /YOUR[_.-]/i.test(url) || /your-?project/i.test(url)) return false;
    try {
      var u = (typeof URL !== "undefined") ? new URL(url) : null;
      return !!u && u.protocol === "https:" && /\.supabase\.(co|in)$/i.test(u.hostname);
    } catch (e) { return false; }
  };

  S.isConfigured = function () {
    var st = S.settings();
    return !!(st && S.validUrl(st.url) && S.validKey(st.key));
  };

  /* ---- bridge to window.Church (church-platform.js) --------------------- */
  function CH() { return (typeof window !== "undefined" && window.Church) || null; }
  S.church = CH;
  S.churchLive = function () { var c = CH(); return !!(c && c.ready && c.configured && c.client); };
  S.online = function () { var c = CH(); if (c && typeof c.online === "boolean") return c.online;
                           return typeof navigator === "undefined" ? true : navigator.onLine !== false; };

  /** Who may open the desk. Decided the way the rest of the app decides it -
      an approved church account - with the welfare roles on top. The code is
      then asked for separately, so this answers "may this person be here at
      all", not "have they typed the code". */
  S.deskPermission = function () {
    var c = CH();
    if (!c || !c.ready) return { mode: "no-platform", allowed: true, signedIn: false, label: "" };
    if (!c.configured) return { mode: "not-configured", allowed: true, signedIn: false, label: "" };
    var signedIn = !!(c.user && c.user.id);
    var member = !!(signedIn && c.isMember && c.isMember());
    var leader = !!(signedIn && c.isLeader && c.isLeader());
    var role = String((c.member && c.member.role) || "").toLowerCase();
    var byRole = CONFIG.deskRoles.indexOf(role) >= 0;
    var allowed = !CONFIG.requireChurchAuth ? true : (member && (leader || byRole || CONFIG.allowMembersFullAccess));
    return {
      mode: "church", signedIn: signedIn, member: member, leader: leader, role: role, byRole: byRole,
      name: (c.member && c.member.display_name) || (c.user && c.user.email) || "Signed in",
      allowed: allowed,
      label: !signedIn ? "Sign in with your church account first"
        : !member ? "Your account is awaiting approval by a leader"
        : allowed ? ((c.member && c.member.display_name) || c.user.email) + (leader ? " (Leader)" : " (" + role + ")")
        : "Signed in, but not on the Support Team"
    };
  };

  /** Realtime: piggy-back on the platform's subscription helper when present. */
  S.watch = function (callback) {
    var c = CH();
    if (c && c.subscribe) { try { return c.subscribe(CONFIG.tableName, callback); } catch (e) {} }
    var cl = S.client();
    if (!cl || !cl.channel) return null;
    try {
      return cl.channel("jcrgm-welfare-" + Math.random().toString(36).slice(2))
        .on("postgres_changes", { event: "*", schema: "public", table: CONFIG.tableName }, callback).subscribe();
    } catch (e) { return null; }
  };

  S.init = function () {
    if (!S.isConfigured()) return null;
    var st = S.settings();
    try {
      var c = CH();
      // Prefer the platform's client: it carries the signed-in user's JWT,
      // which is what row-level security reads, and it keeps one auth session
      // (one token refresh loop, one storage key) for the whole app. church-
      // platform.js starts asynchronously, so when it is ready but not yet
      // configured we wait for it instead of opening a rival connection.
      if (c && c.client) { client = c.client; S.usingPlatformClient = true; return client; }
      S.usingPlatformClient = false;
      if (c && c.ready === false && typeof window !== "undefined" && window.supabase) return null;
      if (typeof window !== "undefined" && window.supabase && window.supabase.createClient) {
        client = window.supabase.createClient(st.url, st.key, {
          auth: { persistSession: false },
          global: {
            headers: { "x-application-name": "JCRGM-Welfare" },
            fetch: function (u, o) { return fetch(u, Object.assign({ cache: "no-store" }, o || {})); }
          }
        });
      }
    } catch (e) { client = null; }
    return client;
  };

  /** Called on every church-identity event: once the platform has built its
      client, drop ours and share theirs (so the RLS policies see the member). */
  S.bindPlatformClient = function () {
    var c = CH();
    if (!c) return false;
    if (c.client && client !== c.client) { client = c.client; S.usingPlatformClient = true; return true; }
    if (!client) S.init();
    return false;
  };

  S.client = function () { return client || S.init(); };
  /** whether a write right now would reach the database at all */
  S.live = function () { return !!S.client(); };

  /* ---- localStorage fallback (always on, also the offline queue) ---------- */
  var LS_RECORDS = "jcrgm_welfare_records_v1";
  var LS_QUEUE = "jcrgm_welfare_queue_v1";
  var LS_SESSION = "jcrgm_welfare_admin_session";

  function hasStorage() { try { return typeof localStorage !== "undefined" && !!localStorage; } catch (e) { return false; } }
  function readLS(key) {
    if (!hasStorage()) return [];
    try { var v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function writeLS(key, arr) {
    if (!hasStorage()) return false;
    try { localStorage.setItem(key, JSON.stringify(arr)); return true; } catch (e) { return false; }
  }

  S.localAll = function () { return readLS(LS_RECORDS).map(W.cleanRecord); };
  S.localUpsert = function (rec) {
    var all = readLS(LS_RECORDS), found = false;
    for (var i = 0; i < all.length; i++) if (all[i].id === rec.id) { all[i] = rec; found = true; }
    if (!found) all.unshift(rec);
    writeLS(LS_RECORDS, all);
    return rec;
  };
  S.localRemove = function (id) {
    var all = readLS(LS_RECORDS).filter(function (r) { return r.id !== id; });
    writeLS(LS_RECORDS, all);
  };

  /* ---- Public API used by the pages ------------------------------------- */
  var DB = {
    /** true when talking to the church's cloud database */
    live: function () { return !!S.client(); },

    /** create: server first (atomic ref no.), always mirrored locally */
    create: function (record) {
      var clean = W.cleanRecord(record);
      clean.id = clean.id || W.uid();
      clean.ref_no = clean.ref_no || W.temporaryRef();
      var c = S.client();
      var p;
      if (c) {
        p = c.rpc(CONFIG.rpcInsert, { p_record: clean }).then(function (res) {
          if (res.error) throw res.error;
          var row = Array.isArray(res.data) ? res.data[0] : res.data;
          if (row && row.ref_no) clean.ref_no = row.ref_no;
          if (row && row.id) clean.id = row.id;
          clean._synced = true; clean._syncError = "";
          return clean;
        }).catch(function (err) { clean._syncError = (err && err.message) || "offline"; clean._offline = true; return clean; });
      } else {
        clean._offline = true;
        p = Promise.resolve(clean);
      }
      // Mirror locally AFTER the server has had its say, so the ref no. the
      // applicant reads off the screen is the same one stored on the device.
      return p.then(function (done) {
        S.localUpsert(done);
        if (!done._synced) { var q = readLS(LS_QUEUE); q.push(done); writeLS(LS_QUEUE, q); }
        return done;
      });
    },

    /** admin: full list (needs Supabase configured, otherwise local only) */
    list: function () {
      var c = S.client();
      if (!c) return Promise.resolve(S.localAll());
      return c.from(CONFIG.tableName).select("*").order("created_at", { ascending: false }).limit(CONFIG.listLimit || 500)
        .then(function (res) {
          if (res.error) throw res.error;
          var rows = (res.data || []).map(W.cleanRecord);
          // merge any not-yet-synced local records so nothing is ever lost
          var ids = {}; rows.forEach(function (r) { ids[r.id] = 1; });
          var local = S.localAll().filter(function (r) { return !ids[r.id]; });
          return local.concat(rows);
        })
        .catch(function () { return S.localAll(); });
    },

    /** public: one case by reference + phone tail — no table read allowed */
    lookup: function (refRaw, phone) {
      var parsed = W.parseRef(refRaw);
      if (!parsed.ok) return Promise.resolve({ ok: false, error: parsed.reason });
      var tail = W.phoneTail(phone);
      if (!/^\d{4}$/.test(tail)) return Promise.resolve({ ok: false, error: "Enter the phone number you applied with so we can verify it's you." });
      // The same test the server applies: exact reference, last four digits.
      function fromDevice() {
        var mine = S.localAll().filter(function (r) {
          return String(r.ref_no).toUpperCase() === parsed.normalized && W.phoneTail(r.phone) === tail;
        });
        return mine[0] || null;
      }
      var c = S.client();
      if (!c) {
        var mine0 = fromDevice();
        return Promise.resolve(mine0 ? { ok: true, record: mine0, local: true }
                                    : { ok: false, error: "No case found on this device with that reference." });
      }
      return c.rpc(CONFIG.rpcLookup, { p_ref: parsed.normalized, p_phone_tail: tail })
        .then(function (res) {
          if (res.error) throw res.error;
          var row = Array.isArray(res.data) ? res.data[0] : res.data;
          if (row) return { ok: true, record: W.cleanRecord(row) };
          // The server says nothing matches, but a case typed on this phone may
          // still be sitting in the queue unsent - answer from there rather
          // than telling a member their own application does not exist.
          var pending = fromDevice();
          if (pending) return { ok: true, record: pending, local: true };
          return { ok: false, error: "We could not match that reference and phone number. Please re-check both, or call the office." };
        })
        .catch(function (e) {
          // Lusaka data drops mid-request: never lose sight of a case just
          // because the cloud is unreachable at this second.
          var fallback = fromDevice();
          if (fallback) return { ok: true, record: fallback, local: true, note: "Shown from this device - the welfare database could not be reached." };
          return { ok: false, error: "Could not reach the welfare database right now. Please try again or call " + CONFIG.phone + "." };
        });
    },

    /** admin: update status / disbursement */
    update: function (id, patch) {
      var all = S.localAll(), target = null;
      for (var i = 0; i < all.length; i++) if (all[i].id === id) target = all[i];
      if (!target) return Promise.reject(new Error("not found"));
      for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) target[k] = patch[k];
      target.updated_at = new Date().toISOString();
      target = W.cleanRecord(target);
      S.localUpsert(target);
      var c = S.client();
      if (!c) { target._offline = true; return Promise.resolve(target); }
      return c.from(CONFIG.tableName).update(target).eq("id", id).select().then(function (res) {
        if (res.error) throw res.error; return target;
      }).catch(function (e) { target._syncError = (e && e.message) || "sync failed"; return target; });
    },

    remove: function (id) {
      S.localRemove(id);
      var c = S.client();
      if (!c) return Promise.resolve();
      return c.from(CONFIG.tableName).delete().eq("id", id).then(function () { return true; }).catch(function () { return false; });
    },

    /** Push everything queued while offline. Returns {sent, failed}. */
    syncQueue: function () {
      var c = S.client();
      if (!c) return Promise.resolve({ sent: 0, failed: 0, reason: S.settings()
        ? "A Supabase project is configured but the key was refused (secret/service-role, malformed or placeholder) — nothing was sent."
        : "No Supabase project is configured — supabase-config.js was not found beside these pages, or its URL/key are blank. Records stay on this device." });
      var q = readLS(LS_QUEUE);
      if (!q.length) return Promise.resolve({ sent: 0, failed: 0, reason: "Nothing queued." });
      var remaining = [], sent = 0, failed = 0;
      var chain = q.reduce(function (p, rec) {
        return p.then(function () {
          return c.rpc(CONFIG.rpcInsert, { p_record: rec }).then(function (res) {
            if (res.error) { failed++; remaining.push(rec); return; }
            var row = Array.isArray(res.data) ? res.data[0] : res.data;
            if (row && row.ref_no) { rec.ref_no = row.ref_no; S.localUpsert(rec); }
            sent++;
          }).catch(function () { failed++; remaining.push(rec); });
        });
      }, Promise.resolve());
      return chain.then(function () {
        writeLS(LS_QUEUE, remaining);
        return { sent: sent, failed: failed, queued: remaining.length };
      });
    },

    queueSize: function () { return readLS(LS_QUEUE).length; },
    storageKey: LS_RECORDS
  };

  /* ==========================================================================
     4. FORM SCHEMAS — drive both forms and the review panel
     ========================================================================== */
  function F(id, label, type, extra) {
    var f = { id: id, label: label, type: type };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) f[k] = extra[k];
    return f;
  }

  /* -- Section A: who we are sponsoring ---------------------------------- */
  var IDENTITY = [
    F("beneficiary_name", "Full name of beneficiary", "text", { required: true, placeholder: "As on NRC / birth card", autoComplete: "name" }),
    F("preferred_name", "Called by (optional)", "text", { placeholder: "Nickname the team should use" }),
    F("dob", "Date of birth", "date", { required: true, hint: "Used to compute age and protect minors." }),
    F("gender", "Gender", "select", { required: true, options: CONFIG.genders }),
    F("nationality", "Nationality", "text", { placeholder: "Zambian", value: "Zambian" }),
    F("beneficiary_nrc", "NRC / birth card number", "text", { placeholder: "123456/10/1", hint: "Keeps the register free of duplicates. Optional for children under 16." }),
    F("orphan_status", "Care situation", "select", { required: true, options: ["Lives with both parents", "Lives with one parent", "Orphan — both parents deceased", "Child-headed household", "With a guardian / foster carer", "Institutional / street-connected", "Adult — self"] }),
    F("marital_status", "Marital status", "select", { options: ["Single", "Married", "Cohabiting", "Separated", "Divorced", "Widowed", "N/A — child"] }),
    F("household_size", "People living in the household", "number", { numeric: true, min: 0, max: 60 }),
    F("dependants", "Number of dependants", "number", { numeric: true, min: 0, max: 40 })
  ];

  /* -- Section B: reachability -------------------------------------------- */
  var CONTACT = [
    F("phone", "Primary phone (WhatsApp if possible)", "tel", { required: true, placeholder: "097X XXX XXX" }),
    F("alt_phone", "Alternate phone", "tel", { placeholder: "Care-giver or neighbour" }),
    F("email", "Email", "email", { placeholder: "name@example.com" }),
    F("province", "Province", "select", { required: true, options: CONFIG.provinces }),
    F("city", "City / town / district", "text", { required: true, placeholder: "Lusaka" }),
    F("compound", "Compound / township / ward", "text", { required: true, placeholder: "e.g. Kanyama, Ward 23" }),
    F("physical_address", "Physical address / house", "text", { placeholder: "House no., street, landmark" }),
    F("nearest_landmark", "Nearest landmark", "text", { placeholder: "Helps a field worker find the home" }),
    F("congregation", "Local congregation / branch", "text", { required: true, placeholder: "Where they worship" }),
    F("member_since", "Member / attending since", "month", {}),
    F("referenced_by", "Referred or vouched for by", "text", { placeholder: "Member, deacon, department, pastor" })
  ];

  /* -- Section C: the support itself -------------------------------------- */
  var ASSISTANCE = [
    F("category", "Category of assistance", "select", { required: true, options: CONFIG.categories.map(function (c) { return c.id; }), optionLabels: CONFIG.categories.map(function (c) { return c.ico + "  " + c.label; }) }),
    F("urgency", "Urgency", "select", { required: true, options: CONFIG.urgency.map(function (u) { return u.id; }), optionLabels: CONFIG.urgency.map(function (u) { return u.label; }) }),
    F("amount_requested", "Amount requested", "number", { required: true, numeric: true, min: 0, step: "0.01", prefix: "currency" }),
    F("currency", "Currency", "select", { required: true, options: CONFIG.currencyOptions.map(function (c) { return c.code; }), optionLabels: CONFIG.currencyOptions.map(function (c) { return c.label; }) }),
    F("period_months", "Number of months this covers", "number", { numeric: true, min: 1, max: 60 }),
    F("support_type", "Support model", "select", { options: ["One-off grant", "Recurring monthly", "Term by term (school)", "In-kind goods", "Full child sponsorship", "Loan to be recovered", "Matched funding"] }),
    F("start_date", "Support starts on", "date", {}),
    F("end_date", "Support ends / next review", "date", {}),
    F("need_description", "Why this help is needed (the story)", "textarea", { required: true, minWords: 15, maxLength: 1500, placeholder: "What has happened, what has already been tried, and exactly what the money or goods will be used for." }),
    F("vulnerability_list", "Vulnerability markers (tick all that apply)", "checks", { options: CONFIG.vulnerability, store: "vulnerability" }),
    F("institution_name", "School / college name", "text", { placeholder: "For education support" }),
    F("institution_contact", "School contact / bursar", "tel", { placeholder: "School office number" }),
    F("facility_name", "Clinic / hospital / pharmacy", "text", { placeholder: "For medical support" }),
    F("orsan_number", "Beneficiary ORSAN / NGO number", "text", { placeholder: "If registered under the NGO Act — optional" }),
    F("disbursement_method", "How the help will be delivered", "select", { options: CONFIG.disbursementMethods }),
    F("disbursement_account", "Mobile money number / bank & account", "text", { placeholder: "e.g. MTN 097X… or ZANACO 123456789", hint: "Where possible, pay institutions directly rather than cash." }),
    F("bank_name", "Bank name", "text", {}),
    F("account_number", "Account number", "text", {})
  ];

  /* -- Section D: paperwork + safeguarding -------------------------------- */
  var DOCUMENTS = [
    F("documents_list", "Documents sighted (tick all received)", "checks", { options: ["NRC copy", "Birth certificate", "Latest school bill / report", "Clinic or hospital letter", "Death certificate(s)", "Burial permit", "Proof of residence / electricity bill", "Photograph of beneficiary", "Referral letter from leader", "Home visit report"], store: "documents" }),
    F("consent_data", "The beneficiary (or guardian) consents to JCRGM collecting and storing this personal information for welfare administration, in line with Zambia's Data Protection Act No. 3 of 2021.", "checkbox", { required: true, checkboxIs: true }),
    F("consent_minor", "Where the beneficiary is under 18, a parent, guardian or custodian consents on their behalf.", "checkbox", { checkboxIs: true }),
    F("consent_photo", "Consent to photograph evidence for donor reporting (names are never published).", "checkbox", { checkboxIs: true }),
    F("declaration", "I confirm the information given is true and complete, and I understand that false claims will end support and be reported to church leadership.", "checkbox", { required: true, checkboxIs: true })
  ];

  /* -- Section E: Support Team only (never shown on the public form) ------ */
  var ADMIN_ONLY = [
    F("sponsor_name", "Sponsor / partner full name", "text", { required: true, placeholder: "Person or organisation funding this" }),
    F("sponsor_phone", "Sponsor phone", "tel", {}),
    F("sponsor_email", "Sponsor email", "email", {}),
    F("sponsor_membership_no", "Sponsor membership number", "text", { placeholder: "Links to the church membership register" }),
    F("sponsor_relation", "Relationship to beneficiary", "text", { placeholder: "Self, member, external partner, diaspora…" }),
    F("sponsor_pledge_total", "Total pledged", "number", { numeric: true, min: 0 }),
    F("sponsor_pledge_monthly", "Monthly pledge", "number", { numeric: true, min: 0 }),
    F("status", "Case status", "select", { options: CONFIG.statuses.map(function (s) { return s.id; }), optionLabels: CONFIG.statuses.map(function (s) { return s.label; }) }),
    F("priority", "Priority", "select", { options: ["normal", "high", "critical"] }),
    F("assigned_to", "Assigned Support Team member", "text", { placeholder: "Who owns this file" }),
    F("admin_notes", "Internal case notes", "textarea", { maxLength: 1500, hint: "Never published to the applicant." }),
    F("decision_notes", "Decision letter to applicant / sponsor", "textarea", { maxLength: 1200, hint: "This is what the applicant sees when they check status." }),
    F("decision_date", "Decision date", "date", {}),
    F("review_date", "Next follow-up review", "date", {}),
    F("disbursed_amount", "Amount actually disbursed", "number", { numeric: true, min: 0 }),
    F("disbursed_date", "Date disbursed", "date", {}),
    F("receipt_ref", "Receipt / proof reference", "text", { placeholder: "Invoice, mobile-money confirmation or receipt no." })
  ];

  var APPLY_NEED_IDS = ["category","urgency","amount_requested","currency","period_months",
    "support_type","need_description","vulnerability_list","institution_name","facility_name",
    "disbursement_method","disbursement_account"];

  var APPLY_FORM = [
    { id: "who",   title: "Who is asking",           ico: "\ud83d\ude4b", fields: [
        F("beneficiary_name","Your full name","text",{required:true,placeholder:"As on your NRC or birth card"}),
        F("dob","Date of birth","date",{required:true}),
        F("gender","Gender","select",{required:true,options:CONFIG.genders}),
        F("nationality","Nationality","text",{placeholder:"Zambian",value:"Zambian"}),
        F("beneficiary_nrc","NRC / birth card number","text",{placeholder:"123456/10/1"}),
        F("orphan_status","Your situation","select",{required:true,options:[
          "Lives with both parents","Lives with one parent","Orphan \u2014 both parents deceased",
          "Child-headed household","With a guardian / foster carer","Institutional / street-connected",
          "Adult \u2014 self"]}),
        F("marital_status","Marital status","select",{options:["Single","Married","Cohabiting","Separated","Divorced","Widowed","N/A \u2014 child"]})
      ] },
    { id: "reach", title: "How we reach you",        ico: "\ud83d\udcde", fields: CONTACT },
    { id: "need",  title: "The need",                ico: "\ud83e\udd32", fields: ASSISTANCE.filter(function (f) { return APPLY_NEED_IDS.indexOf(f.id) >= 0; }) },
    { id: "refs",  title: "Household & references",  ico: "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67", fields: [
        F("household_size","People living in your household","number",{numeric:true,min:0,max:60}),
        F("dependants","Number of dependants","number",{numeric:true,min:0,max:40}),
        F("employment_status","Employment","select",{required:true,options:["Unemployed","Casual / daily labour","Self-employed","Employed \u2014 formal","Pensioner","Student","Unable to work"]}),
        F("congregation","Which congregation do you attend?","text",{required:true,placeholder:"e.g. JCRGM Lusaka Central, or I am not a member yet"}),
        F("referenced_by","Who can vouch for you?","text",{required:true,placeholder:"Cell leader, deacon, pastor, counsellor or neighbour"})
      ] },
    { id: "consent", title: "Declaration",           ico: "\u270d\ufe0f", fields: [
        F("consent_data","I agree that JCRGM may collect and store this information to assess and administer welfare help, in line with Zambia's Data Protection Act No. 3 of 2021. It is seen only by the Support Team.","checkbox",{required:true,checkboxIs:true}),
        F("consent_minor","If I am under 18, my parent, guardian or custodian consents on my behalf.","checkbox",{checkboxIs:true}),
        F("declaration","I confirm that what I have written is true. I understand that a false claim ends support and is reported to church leadership.","checkbox",{required:true,checkboxIs:true})
      ] }
  ];

  var SPONSOR_FORM = [
    { id: "who", title: "Who we are sponsoring", ico: "🧍", fields: IDENTITY },
    { id: "reach", title: "Contact & location", ico: "📍", fields: CONTACT },
    { id: "need", title: "Assistance being provided", ico: "🤲", fields: ASSISTANCE },
    { id: "sponsor", title: "Sponsor / funding source", ico: "💛", fields: ADMIN_ONLY.slice(0, 7) },
    { id: "docs", title: "Vetting, documents & consent", ico: "🗂", fields: DOCUMENTS },
    { id: "admin", title: "Support Team record", ico: "🛡", fields: ADMIN_ONLY.slice(7) }
  ];

  /* ==========================================================================
     5. PUBLIC SHAPE
     ========================================================================== */
  return {
    CONFIG: CONFIG, util: W, db: DB, supabase: S,
    FORMS: { apply: APPLY_FORM, sponsor: SPONSOR_FORM },
    ADMIN_COLUMNS: ["ref_no", "beneficiary_name", "_age", "category", "_status", "amount_requested", "currency",
      "sponsor_name", "phone", "compound", "city", "urgency", "assigned_to", "decision_notes", "disbursed_amount", "receipt_ref", "created_at"],
    FULL_COLUMNS: RECORD_KEYS
  };
})();

/* Expose for Node test harness without disturbing the browser */
if (typeof module !== "undefined" && module.exports) { module.exports = { JCRGM: JCRGM }; }
