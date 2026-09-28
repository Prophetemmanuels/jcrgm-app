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
    /* Mirrors public.jcrgm_desk_roles() in supabase-schema.sql - the engine
       test compares the two, so change both or neither. */
    deskRoles: ["welfare", "diaconia", "leader", "pastor", "administrator", "admin", "deacon", "secretary"],
    leaderRoles: ["leader", "pastor", "administrator", "admin"],  // = public.jcrgm_leader_roles(): deletes only
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

  /* The columns Postgres types strictly, mirrored from supabase-schema.sql:
     test/jcrgm-engine.test.js re-reads the schema and fails if the two drift.
     Everything else is text, where '' is a legitimate empty answer. */
  var DATE_COLS = { dob: 1, start_date: 1, end_date: 1, decision_date: 1, review_date: 1, disbursed_date: 1 };
  var STAMP_COLS = { created_at: 1, updated_at: 1 };
  var NUM_COLS = { amount_requested: 1, disbursed_amount: 1, sponsor_pledge_total: 1, sponsor_pledge_monthly: 1 };
  var INT_COLS = { household_size: 1, dependants: 1, period_months: 1 };
  var BOOL_COLS = { consent_data: 1, consent_minor: 1, consent_photo: 1, declaration: 1 };
  var JSON_COLS = { documents: 1, vulnerability: 1 };
  W.columnKinds = { date: DATE_COLS, timestamp: STAMP_COLS, numeric: NUM_COLS, smallint: INT_COLS,
                    boolean: BOOL_COLS, jsonb: JSON_COLS };

  /** A plain YYYY-MM-DD, or '' when it is not a real day. Postgres' date type
      wants the calendar form; an ISO stamp works too, so both are normalised
      here instead of being argued about downstream. */
  W.validDate = function (v) {
    if (v === null || v === undefined || v === "") return "";
    var str = String(v);
    var m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      var d = new Date(+m[1], +m[2] - 1, +m[3]);
      var okDay = d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3];
      return okDay ? m[0] : "";
    }
    var t = Date.parse(str);
    if (isNaN(t)) return "";
    var dt = new Date(t);
    function p2(x) { return (x < 10 ? "0" : "") + x; }
    return dt.getFullYear() + "-" + p2(dt.getMonth() + 1) + "-" + p2(dt.getDate());
  };

  /** Column id -> the words the form uses, so an error can name the box. */
  var FIELD_LABELS = null;
  function buildLabels(extra) {
    if (FIELD_LABELS && !extra) return FIELD_LABELS;
    var out = FIELD_LABELS || (FIELD_LABELS = {});
    function walk(defs) {
      (defs || []).forEach(function (sec) {
        (sec.fields || []).forEach(function (f) {
          if (f && f.id && f.label && !out[f.id]) out[f.id] = f.label;
        });
      });
    }
    walk(typeof APPLY_FORM !== "undefined" ? APPLY_FORM : null);
    walk(typeof SPONSOR_FORM !== "undefined" ? SPONSOR_FORM : null);
    if (extra) Object.keys(extra).forEach(function (k) { walk(extra[k]); });
    return out;
  }
  /* Built from the form definitions themselves, lazily, so the labels are there
     whether the error is raised in the browser or in a Node test - and so they
     can never disagree with what the form actually shows. */
  Object.defineProperty(W, "fieldLabels", { get: function () { return buildLabels(); }, enumerable: true });
  W.indexFieldLabels = function (forms) { return buildLabels(forms); };

  /**
   * Turn a mirror record into something Postgres will accept. A blank in a
   * strongly typed column is *no answer*, so it goes out as null - which is
   * also how the desk clears a date it typed by mistake.
   */
  W.toWire = function (obj) {
    var out = {}, k;
    obj = obj || {};
    for (k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      if (k.charAt(0) === "_" && k !== "_id") continue;          // device bookkeeping
      var v = obj[k];
      var blank = v === "" || v === null || v === undefined;
      if (DATE_COLS[k]) {
        if (blank) { out[k] = null; continue; }
        var d = W.validDate(v);
        if (!d) { var err = new Error(d + ""); err.field = k; err.value = v; throw err; }
        out[k] = d; continue;
      }
      if (STAMP_COLS[k]) { out[k] = blank ? null : (W.validIso(v) || null); continue; }
      if (NUM_COLS[k]) {
        if (blank) { out[k] = null; continue; }
        var m2 = Number(v); out[k] = isFinite(m2) ? Math.round(m2 * 100) / 100 : null; continue;
      }
      if (INT_COLS[k]) {
        if (blank) { out[k] = null; continue; }
        var n = Number(v); out[k] = isFinite(n) ? Math.round(n) : null; continue;
      }
      if (BOOL_COLS[k]) { out[k] = (v === true || v === "true" || v === "on"); continue; }
      if (JSON_COLS[k]) { out[k] = Array.isArray(v) ? v.map(W.sanitise).slice(0, 12) : []; continue; }
      if (v && typeof v === "object") { out[k] = v; continue; }
      out[k] = blank ? "" : W.sanitise(v);
    }
    return out;
  };

  /** A Postgres / PostgREST error in words a welfare volunteer can act on. */
  W.explainError = function (e, labels) {
    if (!e) return "the database did not say why";
    var msg = String(e.message || e);
    labels = labels || {};
    var col = e.column || null;
    if (!col) { var mc = msg.match(/column (\w+)/i); if (mc) col = mc[1]; }
    var what = col ? (labels[col] || col) : null;
    if (/invalid input syntax for type (date|timestamp)/i.test(msg))
      return what ? what + " is not a date the database can read. Leave it blank, or type a real date (2026-09-28)."
                  : "One of the dates on this file is not one the database can read. Blank is fine; half-typed is not."
    if (/invalid input syntax for type numeric/i.test(msg)) return (what || "An amount") + " must be a number, or blank.";
    if (/violates check constraint/i.test(msg))
      return "A value on this file is outside the choices the register allows" + (what ? " (" + what + ")" : "") + ".";
    if (/null value in column/i.test(msg)) {
      var m2 = msg.match(/column "?(\w+)"?/i);
      return "A required detail came through empty: " + ((m2 && labels[m2[1]]) || (m2 && m2[1]) || "check the form");
    }
    if (/permission denied|row-level security|insufficient pr/i.test(msg + " " + (e.hint || "")))
      return "your account is not allowed to write this row (check the Support Team role, or re-run supabase-schema.sql)";
    return e.hint ? msg + " - " + e.hint : msg;
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
    var role = String((c.member && c.member.role) || "").toLowerCase();
    var leader = !!(signedIn && ((c.isLeader && c.isLeader()) || CONFIG.leaderRoles.indexOf(role) >= 0));
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
      /* No client yet, but the church layer exists and may still be restoring
         the session: wait for it instead of opening a key-only connection that
         would then be cached and used for every write. */
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
  /**
   * Read-only checks, made with the same connection the failing write used, so
   * the answer describes reality instead of a guess. Nothing here can change a
   * record: the two calls are the schema's own `select` helpers.
   */
  S.selfTest = function () {
    var out = { ok: false, verdict: "", checks: [], advice: "" };
    /* the desk re-reads the register while this runs, which repaints the banner: the
       answer has to live on the engine, not only in the DOM node it filled */
    var finished = function (o) { S.lastSelfTest = o; return o; };
    var st = S.settings();
    if (!st) {
      out.verdict = "no-project";
      out.advice = "supabase-config.js is not beside these pages, or its URL/key are blank, so there is nothing to write to yet.";
      return Promise.resolve(finished(out));
    }
    var p = CH();
    var signedIn = !!(p && p.user && p.user.id);
    out.checks.push({ name: "signed in with a church account", pass: signedIn });
    if (!signedIn) { out.verdict = "signed-out"; out.advice = "Sign in with the church account first - the register is not opened by the team code alone."; return Promise.resolve(finished(out)); }
    var wasOwn = S.usingPlatformClient === false;
    var c = S.client();                       // re-attaches to the church client if one appeared
    var reattached = wasOwn && S.usingPlatformClient !== false;
    if (!c) {
      out.verdict = "no-client";
      out.advice = "The project is configured but no connection could be opened with that key (check supabase-config.js).";
      return Promise.resolve(finished(out));
    }
    out.checks.push({ name: "your church sign-in is the connection being used",
                      pass: S.usingPlatformClient !== false || !(p && p.client),
                      fix: reattached ? "re-attached just now" : "" });
    return Promise.all([
      c.rpc("jcrgm_is_desk").then(function (r) { return r; }, function (e) { return { error: e }; }),
      c.rpc("jcrgm_is_leader").then(function (r) { return r; }, function (e) { return { error: e }; })
    ]).then(function (both) {
      var d = both[0], l = both[1];
      var missing = function (r) { return r && r.error && /PGRST202|PGRST205|not find/.test((r.error.message || "") + " " + (r.error.code || "")); };
      var denied = function (r) { return r && r.error && /permission denied|42501/.test(r.error.message || ""); };
      var truthy = function (r) { var v = r && r.data; return Array.isArray(v) ? v[0] === true : v === true; };
      if (missing(d) || missing(l)) {
        out.verdict = "schema-missing";
        out.checks.push({ name: "the welfare schema is present", pass: false });
        out.advice = "supabase-schema.sql has not been run in this project, or stopped part-way. Run the whole file again - it is safe to re-run.";
        return finished(out);
      }
      if (denied(d)) {
        out.verdict = "not-granted";
        out.checks.push({ name: "this key may call the welfare functions", pass: false });
        out.advice = "The database refuses even the read-only check, so the grants are missing: re-run supabase-schema.sql.";
        return finished(out);
      }
      out.checks.push({ name: "the database counts you as Support Team", pass: truthy(d) });
      out.checks.push({ name: "the database counts you as a leader (needed to delete)", pass: truthy(l) });
      if (!truthy(d)) {
        out.verdict = "not-desk-member";
        out.advice = "The church sees your account, but not as an approved Support Team member. In Announcements → Manage member access, approve this account and set its role to one of: "
          + CONFIG.deskRoles.join(", ") + ". Then Reload.";
        return finished(out);
      }
      out.ok = true; out.verdict = "clear";
      if (reattached) out.advice = "This page had been talking to the database with the project key instead of your sign-in; it is using your church session now, so Retry should write.";
      out.advice = "The database accepts this connection as a Support Team member. If a write still says Not written, the row itself is the problem - Retry, and if it refuses again the exact Postgres text is shown beside it.";
      return finished(out);
    }).catch(function (e) {
      out.verdict = "unreachable";
      out.advice = "The check itself could not reach the project (" + ((e && e.message) || e) + "). On a phone with no signal this is normal - try again when you have bars.";
      return finished(out);
    });
  };
  S.bindPlatformClient = function () {
    var c = CH();
    if (!c) return false;
    if (c.client && client !== c.client) { client = c.client; S.usingPlatformClient = true; return true; }
    if (!client) S.init();
    return false;
  };

  S.client = function () {
    /* RLS reads the user's JWT, not the publishable key. If the platform has
       since produced its client - it starts asynchronously, and this page used
       to grab a rival key-only connection and keep it for the whole session -
       every write would run as `anon`, be filtered by policy, and look exactly
       like a half-installed schema. So the binding is re-checked on every use. */
    var c0 = CH();
    if (c0 && c0.client && client !== c0.client) { client = c0.client; S.usingPlatformClient = true; }
    return client || S.init();
  };
  /** whether a write right now would reach the database at all */
  S.live = function () { return !!S.client(); };
  S.lastListError = null;

  /* ---- localStorage fallback (always on, also the offline queue) ---------- */
  var LS_RECORDS = "jcrgm_welfare_records_v1";
  var LS_QUEUE = "jcrgm_welfare_queue_v1";
  var LS_UNSAVED = "jcrgm_welfare_unsaved_v1";
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

  /* Unsaved-change ledger. PostgREST answers "204, no rows" for a write that
     row-level security filtered out, so the page cannot rely on the response
     alone; it keeps its own note of which cases carry a change the database has
     not accepted, and stamps that on the row every time the list is re-read
     from the server. Without this, the next reload paints the server's stale
     copy and the desk sees its click disappear. */
  S.unsavedMap = function () {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(LS_UNSAVED) || "null"); } catch (e) { return {}; }
    if (!raw) return {};
    var out = {};
    if (Array.isArray(raw)) {                       // the shape before reasons existed
      raw.forEach(function (x) {
        if (typeof x === "string") out[x] = "";
        else if (x && x.id) out[x.id] = x.why || "";
      });
      return out;
    }
    if (typeof raw === "object") { Object.keys(raw).forEach(function (k) { out[k] = String(raw[k] || ""); }); }
    return out;
  };
  S.unsavedIds = function () { return Object.keys(S.unsavedMap()); };
  S.unsavedReason = function (id) { return S.unsavedMap()[id] || ""; };
  /** Remembered per case, because the desk reads the register again after a
      refused write: without this the row's own reason is lost and all that is
      left to say is "the database refused the change". */
  S.markUnsaved = function (id, why) {
    if (!id) return;
    var m = S.unsavedMap();
    m[id] = String(why || m[id] || "").slice(0, 400);
    try { localStorage.setItem(LS_UNSAVED, JSON.stringify(m)); } catch (e) {}
  };
  S.clearUnsaved = function (id) {
    var m = S.unsavedMap();
    if (!(id in m)) return;
    delete m[id];
    try { if (Object.keys(m).length) localStorage.setItem(LS_UNSAVED, JSON.stringify(m)); else localStorage.removeItem(LS_UNSAVED); } catch (e) {}
  };
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
        p = c.rpc(CONFIG.rpcInsert, { p_record: W.toWire(clean) }).then(function (res) {
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
          S.lastListError = null;
          var byId = {}; S.localAll().forEach(function (r) { byId[r.id] = r; });
          var unsaved = {}; S.unsavedIds().forEach(function (id) { unsaved[id] = 1; });
          var rows = (res.data || []).map(W.cleanRecord).map(function (r) {
            if (!unsaved[r.id]) return r;
            var m = byId[r.id];
            // The server's row wins on every field it holds; the attempted
            // changes are layered back over it so the desk can see exactly
            // what is waiting to be written, and the row cannot revert.
            if (m) { Object.keys(m).forEach(function (k) { if (k.charAt(0) === "_") return; r[k] = m[k]; }); }
            r._pending = true;
            // The reason the desk deserves is the one the server gave for THIS
            // row, kept in the ledger - not a generic restatement.
            r._syncError = S.unsavedReason(r.id) || (m && m._syncError) ||
                           "written on this device only - the database refused the change";
            return r;
          });
          // merge any not-yet-synced local records so nothing is ever lost
          var ids = {}; rows.forEach(function (r) { ids[r.id] = 1; });
          var local = S.localAll().filter(function (r) { return !ids[r.id]; });
          local.forEach(function (r) { r._pending = true; if (!r._syncError) r._syncError = "not yet written to the database"; });
          return local.concat(rows);
        })
        .catch(function (e) {
          // Remember it, so the desk can say out loud that what it is looking
          // at is the device's copy, not the church's register. A silent
          // fallback here is how a broken install looks like a working one.
          S.lastListError = (e && (e.message || e.hint)) || String(e || "the read failed");
          return S.localAll();
        });
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
    /**
     * admin: amend a case. The write is verified, not assumed: PostgREST
     * answers 204 with zero rows when row-level security (or a missing grant,
     * or a policy that only leaders satisfy) filtered the UPDATE away, and
     * that is NOT an error - so an earlier version of this reported "saved"
     * while nothing had changed and the next reload quietly reverted the row.
     */
    update: function (id, patch) {
      var all = S.localAll(), target = null;
      for (var i = 0; i < all.length; i++) if (all[i].id === id) target = all[i];
      if (!target) return Promise.reject(new Error("This case is not in this device's copy, so it cannot be amended here."));
      for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) target[k] = patch[k];
      target.updated_at = new Date().toISOString();
      target = W.cleanRecord(target);
      var c = S.client();
      if (!c) {
        target._offline = true; target._syncError = "";
        S.localUpsert(target);
        return Promise.resolve({ record: target, synced: false, reason: "kept on this device — no database connection configured" });
      }
      var wire;
      try { wire = W.toWire(target); }                          // blanks -> null, dates -> YYYY-MM-DD
      catch (e) {
        var bad = (W.fieldLabels[e.field] || e.field || "a field") + " - \"" + e.value + "\" is not a date.";
        target._syncError = bad;
        target._pending = true;
        S.localUpsert(target); S.markUnsaved(id, "Fix that before it can be saved: " + bad);
        return Promise.resolve({ record: target, synced: false, refused: true, badField: true,
                                 reason: "Fix that before it can be saved: " + bad });
      }
      return c.from(CONFIG.tableName).update(wire).eq("id", id).select().then(function (res) {
        if (res.error) throw res.error;
        var row = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!row) {                                    // 204 / [] : the write was dropped
          var refusedWhy = "no row was updated — this connection is not allowed to change that row. Run “Check the connection” under the banner: it will say whether the account or the schema is at fault.";
          target._syncError = refusedWhy;
          target._pending = true;
          S.localUpsert(target); S.markUnsaved(id, refusedWhy);
          return { record: target, synced: false, refused: true, reason: refusedWhy };
        }
        var done = W.cleanRecord(row);
        done._syncError = ""; done._pending = false; done._synced = true;
        S.localUpsert(done); S.clearUnsaved(id);
        return { record: done, synced: true };
      }).catch(function (e) {
        target._syncError = (e && (e.message || e.code)) || "the server rejected the change";
        target._pending = true;
        S.localUpsert(target); S.markUnsaved(id, W.explainError(e, W.fieldLabels));
        // The raw Postgres text stays on the record for the log; the desk gets
        // a sentence that names the box to fix.
        return { record: target, synced: false, reason: W.explainError(e, W.fieldLabels),
                 code: (e && e.code) || "", detail: (e && (e.details || e.hint)) || "" };
      });
    },

    /** admin: delete a case. Removal from this device happens only once the
        server agrees, so a refused delete can never look like a successful one
        (deleting welfare records is not a thing to get wrong twice). */
    remove: function (id) {
      var c = S.client();
      if (!c) {
        S.localRemove(id);
        return Promise.resolve({ synced: false, removed: true, reason: "deleted from this device only — no database connection configured" });
      }
      return c.from(CONFIG.tableName).delete().eq("id", id).select("id").then(function (res) {
        if (res.error) throw res.error;
        var hit = Array.isArray(res.data) ? res.data.length > 0 : !!res.data;
        if (!hit) {
          return { synced: false, removed: false, refused: true, record: S.localAll().filter(function (r) { return r.id === id; })[0] || null,
                   reason: "nothing was deleted — the database did not let this account remove that row (check your role, or run supabase-schema.sql)" };
        }
        S.localRemove(id); S.clearUnsaved(id);
        return { synced: true, removed: true };
      }).catch(function (e) {
        return { synced: false, removed: false, reason: (e && e.message) || "the server rejected the delete" };
      });
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

    /** Changes that exist only on this phone (refused or unsent edits). */
    pending: function () {
      return S.localAll().filter(function (r) { return r._pending || r._syncError; });
    },

    /** Re-applies refused/unsent edits after the account or the schema is
        fixed. Deletes are NOT replayed from here: a removal is expressed as
        status "closed" in this register, and genuine deletion stays a
        deliberate, per-click act rather than something retried in the background. */
    replayPending: function () {
      var list = DB.pending();
      var done = 0, still = 0, firstErr = "";
      var chain = list.reduce(function (pr, rec) {
        return pr.then(function () {
          var queued = readLS(LS_QUEUE).some(function (q) { return q.id === rec.id; });
          /* A case the server has never seen cannot be UPDATEd - a patch would
             match zero rows and be reported as refused forever. Those go through
             the insert function, which mints the reference as usual. */
          var send = queued ? DB.create(rec).then(function (row) {
            var oki = row && !row._offline && row._synced !== false && !row._syncError;
            return { synced: !!oki, reason: oki ? "" : ((row && row._syncError) || "the insert was refused") };
          }) : (function () {
            var patch = {};
            Object.keys(rec).forEach(function (k) { if (k.charAt(0) !== "_" && k !== "id") patch[k] = rec[k]; });
            return DB.update(rec.id, patch);
          })();
          return send.then(function (res) {
            if (res && res.synced) {
              writeLS(LS_QUEUE, readLS(LS_QUEUE).filter(function (q) { return q.id !== rec.id; }));
              S.clearUnsaved(rec.id);            // the ledger note is paid off too
              done++;
            } else { still++; firstErr = firstErr || ((res && res.reason) || "still refused"); }
          });
        });
      }, Promise.resolve());
      return chain.then(function () { return { attempted: list.length, written: done, still: still, reason: firstErr }; });
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
