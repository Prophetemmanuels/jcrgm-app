/* ============================================================================
   JCRGM — COMPASSION & WELFARE PORTAL   (jcrgm-support-team.js)
   ----------------------------------------------------------------------------
   Everything on the page is driven by the schema in jcrgm-config.js:
   fields, categories, statuses, contacts and the admin gate.  No markup here
   hard-codes a church detail, so a rename is a one-file edit.

   Structure
     0. helpers          4. apply wizard       8. export + print
     1. chrome/tabs      5. status lookup      9. boot
     2. branding         6. admin gate        10. unit-test hooks
     3. notices          7. desk + drawer
   ==========================================================================*/
(function () {
  "use strict";

  var J = window.JCRGM;
  if (!J) { document.body.innerHTML = "<p style='padding:24px;font-family:sans-serif'>jcrgm-config.js failed to load. Put it in the same folder as this page.</p>"; return; }
  var CONFIG = J.CONFIG, W = J.util, DB = J.db, FORMS = J.FORMS;

  /* ══════════════ 0. HELPERS ══════════════════════════════════════════ */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  var uidSeq = 0;
  function nid(p) { uidSeq++; return p + "-" + uidSeq; }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 240); }; }
  function nice(d) { return d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"; }
  function ago(iso) {
    var d = W.daysSince(iso);
    if (d === null) return "";
    if (d <= 0) return "today";
    if (d === 1) return "yesterday";
    if (d < 30) return d + " days ago";
    if (d < 365) return Math.round(d / 30) + " months ago";
    return Math.round(d / 365) + " yr ago";
  }

  /* ══════════════ 3. NOTICES (toasts) ═════════════════════════════════ */
  var toastBox = $("#toasts");
  function toast(msg, kind, title, life) {
    var icon = { ok: "✅", err: "⛔", warn: "⚠️", info: "ℹ️" }[kind || "info"];
    var t = el("div", "toast " + (kind || "info"),
      '<span class="tx" aria-hidden="true">' + icon + '</span><div>' +
      (title ? "<b>" + esc(title) + "</b>" : "") + esc(msg) + "</div>");
    toastBox.appendChild(t);
    var life = life || (kind === "err" ? 9000 : 4600);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }, life);
    return t;
  }

  function busy(btn, on, label) {
    if (!btn) return;
    btn.classList.toggle("busy", !!on);
    btn.disabled = !!on;
    var lb = $(".lb", btn);
    if (lb) { if (on) { lb.dataset.prev = lb.textContent; lb.textContent = label || "Working…"; } else if (lb.dataset.prev) lb.textContent = lb.dataset.prev; }
  }

  /* ══════════════ 2. BRANDING (all copy from config) ═════════════════ */
  function brand() {
    $("#mastUnit").textContent = CONFIG.unitName;
    $("#mastTitle").innerHTML = esc(CONFIG.shortName) + ' <span class="gold">Support Team</span>';
    $("#mastSub").textContent = "The welfare desk of " + CONFIG.fullName + " — registering the people we sponsor, and opening the door to anyone who needs help.";
    $("#mastVerse").innerHTML = esc(CONFIG.verseText) + " <b>— " + esc(CONFIG.verseRef) + "</b>";
    var call = $("#pillCall"); call.href = "tel:+" + W.normalisePhone(CONFIG.phone);
    $("#pillCall span").textContent = CONFIG.phone;
    $("#pillMap").href = CONFIG.mapLink;
    var hv = $("#homeVerse");
    hv.innerHTML = "<span>" + esc(CONFIG.verseTextAlt) + "</span><cite>" + esc(CONFIG.verseRefAlt) + "</cite>";
    $("#footChurch").textContent = CONFIG.fullName;
    $("#footCall").href = "tel:+" + W.normalisePhone(CONFIG.phone);
    $("#footCall span").textContent = CONFIG.phone;
    $("#footMail").href = "mailto:" + CONFIG.email;
    $("#footMail span").textContent = CONFIG.email;
    $("#footMap").href = CONFIG.mapLink;
    $("#footVer").textContent = CONFIG.shortName + " Compassion & Welfare v" + CONFIG.version;
    var ec = $("#emergCall");
    if (ec) { ec.href = "tel:+" + W.normalisePhone(CONFIG.phone); ec.textContent = CONFIG.phone; }
    $("#footYear").textContent = new Date().getFullYear();
    $("#lockFoot").textContent = CONFIG.unitName + " · " + CONFIG.officeHours;
    document.title = CONFIG.teamName + " — Compassion & Welfare | " + CONFIG.fullName;

    $("#homeCats").innerHTML = CONFIG.categories.map(function (c) {
      return '<div class="cati"><span class="ci" aria-hidden="true">' + esc(c.ico) + "</span>" +
             '<div class="cb"><b>' + esc(c.label) + "</b><small>" + esc(c.note) + "</small></div></div>";
    }).join("");
  }

  /* connection + identity pills */
  function paintMode() {
    var p = $("#pillMode"), q = $("#pillQueue"), who = $("#pillWho");
    var st = J.supabase.settings ? J.supabase.settings() : null;
    if (DB.live()) {
      p.innerHTML = '<span class="dot"></span>Live — ' + esc(st && st.source ? st.source.split(" — ")[0].split(" (")[0] : "church project");
      p.title = "Connected to " + esc((st && st.url) || "") + "\n" + esc((st && st.source) || "") +
                "\nAll phones in the app share one register.";
    } else {
      p.innerHTML = '<span class="dot off"></span>On this device — no cloud project yet';
      p.title = "No usable Supabase settings were found. Records stay in this phone and queue. " +
                "The church app ships supabase-config.js; run supabase-schema.sql in that project to connect.";
    }
    var n = DB.queueSize();
    if (n > 0) { q.hidden = false; q.innerHTML = "📥 " + n + " waiting to sync"; }
    else q.hidden = true;

    var perm = J.supabase.deskPermission ? J.supabase.deskPermission() : { mode: "no-platform" };
    if (perm.mode === "church") {
      who.hidden = false;
      who.innerHTML = perm.signedIn
        ? '👤 ' + esc(perm.name || "Signed in") + (perm.leader ? " · Leader" : "")
        : '👤 <button class="pillbtn" type="button" id="whoSignin">Sign in</button>';
      who.title = perm.label || "";
      var sb = $("#whoSignin");
      if (sb) sb.addEventListener("click", function () { openAuth(); });
    } else { who.hidden = true; }
  }
  function openAuth() { var c = window.Church; if (c && c.openAuth) c.openAuth("login"); else toast("The church sign-in is not loaded on this page.", "warn"); }
  function signOut() { var c = window.Church; if (c && c.signOut) c.signOut().then(function () { paintMode(); refreshAccess(); closeDesk("Signed out."); }); }

  /* ══════════════ 1. TABS ═════════════════════════════════════════════ */  /* ══════════════ 1. TABS ═════════════════════════════════════════════ */
  var TABS = ["home", "apply", "status", "admin"];
  function show(tab, push) {
    if (TABS.indexOf(tab) < 0) tab = "home";
    TABS.forEach(function (t) {
      var btn = $("#tab-" + t), pnl = $("#p-" + t);
      var on = t === tab;
      btn.setAttribute("aria-selected", on ? "true" : "false");
      pnl.hidden = !on;
      if (on && push !== false) pnl.focus({ preventScroll: true });
    });
    if (push !== false) { try { history.replaceState(null, "", "#" + tab); } catch (e) { location.hash = tab; } }
    if (tab === "admin") adminEnter();
    if (tab === "home") paintHomeStats();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $("#tab-home").parentNode.addEventListener("click", function (e) {
    var b = e.target.closest(".tab"); if (b) show(b.dataset.tab);
  });
  $("#tab-home").parentNode.addEventListener("keydown", function (e) {
    if (["ArrowRight", "ArrowLeft", "Home", "End"].indexOf(e.key) < 0) return;
    var i = TABS.indexOf(document.activeElement.dataset.tab); if (i < 0) i = 0;
    var n = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i + TABS.length - 1) % TABS.length
      : e.key === "Home" ? 0 : TABS.length - 1;
    show(TABS[n]); $("#tab-" + TABS[n]).focus(); e.preventDefault();
  });
  $$("[data-go]").forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.go); }); });

  /* ══════════════ FIELD RENDERER (shared by both forms) ══════════════ */
  function fieldNode(f, values, prefix) {
    var id = prefix + "-" + f.id;
    var v = values[f.id];
    var wrap = el("div", "field" + (f.type === "textarea" || f.type === "checks" || (f.span2 !== false && (f.type === "checkbox" || f.id === "need_description")) ? " span2" : ""));
    wrap.dataset.field = f.id;

    if (f.type === "checks") {
      var stored = values[f.store] || [];
      wrap.appendChild(el("label", null, esc(f.label) + (f.required ? ' <span class="req" aria-hidden="true">*</span>' : ' <span class="opt">optional</span>')));
      if (f.hint) wrap.appendChild(el("span", "hint", esc(f.hint)));
      var chips = el("div", "chips");
      chips.setAttribute("role", "group");
      chips.setAttribute("aria-label", f.label);
      (f.options || []).forEach(function (opt, i) {
        var on = stored.indexOf(opt) >= 0;
        var lab = el("label", "chip" + (on ? " on" : ""));
        lab.innerHTML = '<input type="checkbox" name="' + esc(f.store) + '" data-check="' + esc(f.store) + '" data-val="' + esc(opt) + '"' + (on ? " checked" : "") + '>' +
          '<span class="box" aria-hidden="true"></span><span class="lb">' + esc(opt) + "</span>";
        chips.appendChild(lab);
      });
      wrap.appendChild(chips);
      wrap.appendChild(el("span", "err", '<span aria-hidden="true">⚠</span><span class="em"></span>'));
      return wrap;
    }

    if (f.type === "checkbox") {
      var checked = v === true || v === "true" || v === "on";
      var c = el("label", "consent" + (checked ? " on" : ""));
      c.setAttribute("for", id);
      c.innerHTML = '<input type="checkbox" id="' + esc(id) + '" name="' + esc(f.id) + '" data-field="' + esc(f.id) + '"' + (checked ? " checked" : "") + ">" +
        '<span class="tick" aria-hidden="true"></span><span class="ct">' + esc(f.label) +
        (f.hint ? '<span class="hint" style="margin-top:4px">' + esc(f.hint) + "</span>" : "") + "</span>";
      wrap.appendChild(c);
      wrap.appendChild(el("span", "err", '<span aria-hidden="true">⚠</span><span class="em"></span>'));
      return wrap;
    }

    wrap.appendChild(el("label", null, esc(f.label) + (f.required ? ' <span class="req" aria-hidden="true">*</span>' : ' <span class="opt">optional</span>')));
    if (f.hint) wrap.appendChild(el("span", "hint", esc(f.hint)));

    var input;
    if (f.type === "select") {
      input = el("select", "inp");
      input.appendChild(new Option(f.required ? "— choose one —" : "— not applicable —", ""));
      (f.options || []).forEach(function (o, i) {
        var label = f.optionLabels ? f.optionLabels[i] : o;
        input.appendChild(new Option(label, o));
      });
      if (v) input.value = v;
    } else if (f.type === "textarea") {
      input = el("textarea", "inp");
      input.rows = 5;
      input.value = v || "";
      if (f.maxLength) input.maxLength = f.maxLength + 400;
    } else {
      input = el("input", "inp");
      input.type = f.type === "number" ? "number" : f.type;
      if (f.type === "number") { input.step = f.step || "any"; if (f.min != null) input.min = f.min; if (f.max != null) input.max = f.max; }
      if (f.type === "date") input.max = W.todayISO();
      input.value = v || "";
      if (f.inputmode) input.inputMode = f.inputmode;
    }
    input.id = id;
    input.name = f.id;
    input.dataset.field = f.id;
    var lbl = wrap.querySelector("label");
    if (lbl) lbl.setAttribute("for", id);
    if (f.placeholder) input.placeholder = f.placeholder;
    if (f.autoComplete) input.autocomplete = f.autoComplete;
    if (f.required) input.setAttribute("aria-required", "true");
    if (f.prefix === "currency") {
      var box = el("div", "adorn");
      box.appendChild(el("span", "pre", "K"));
      box.appendChild(input);
      wrap.appendChild(box);
      var pre = box.querySelector(".pre");
      input.addEventListener("input", function () {
        var cur = values.currency || CONFIG.currencyDefault;
        if (pre) pre.textContent = { ZMW: "K", USD: "$", EUR: "€", GBP: "£" }[cur] || "K";
      });
    } else wrap.appendChild(input);

    if (f.type === "textarea" && f.maxLength) {
      var cc = el("span", "counter", "0 / " + f.maxLength);
      wrap.appendChild(cc);
      var tick = function () {
        var n = input.value.length;
        cc.textContent = n + " / " + f.maxLength;
        cc.classList.toggle("over", n > f.maxLength);
      };
      input.addEventListener("input", tick); tick();
    }
    if (f.id === "dob") {
      var ah = el("span", "hint", null);
      ah.dataset.hint = "dob";
      var paint = function () {
        var a = W.ageFromDob(input.value);
        ah.innerHTML = a === null ? "" : (a < 18
          ? "⚠️ <b>Age " + a + " — a minor.</b> A parent or guardian must consent below, and a guardian's phone is required."
          : "Age " + a + " · born " + nice(input.value));
        ah.style.color = a !== null && a < 18 ? "var(--violet)" : "";
      };
      input.addEventListener("change", paint);
      input.addEventListener("input", paint);
      paint();
      wrap.appendChild(ah);
    }
    if (f.type === "tel") input.addEventListener("blur", function () { if (W.isValidPhone(input.value)) input.value = W.normalisePhone(input.value); });
    if (f.id === "beneficiary_nrc") input.addEventListener("blur", function () { input.value = W.nrc(input.value); });

    wrap.appendChild(el("span", "err", '<span aria-hidden="true">⚠</span><span class="em"></span>'));
    return wrap;
  }

  function renderSections(host, sections, values, prefix, currentStep) {
    host.innerHTML = "";
    sections.forEach(function (sec, si) {
      if (currentStep != null && si !== currentStep) return;
      var fs = el("fieldset", "fs");
      fs.appendChild(el("legend", null, '<span class="si" aria-hidden="true">' + esc(sec.ico || "") + "</span> " + esc(sec.title)));
      if (sec.note) fs.appendChild(el("p", "fs-note", esc(sec.note)));
      var g = el("div", "grid");
      sec.fields.forEach(function (f) { g.appendChild(fieldNode(f, values, prefix + si)); });
      fs.appendChild(g);
      host.appendChild(fs);
    });
  }

  /* Phone numbers must be normalised even when the user never leaves the
     field (they may hit Continue straight away) — otherwise the register
     stores "0971…" and the status lookup compares it against "26097…". */
  function normaliseTel(host, values) {
    $$("input[type=tel]", host).forEach(function (n) {
      var k = n.dataset.field;
      if (k && values[k] && W.isValidPhone(values[k])) {
        var fixed = W.normalisePhone(values[k]);
        if (fixed !== values[k]) { values[k] = fixed; n.value = fixed; }
      }
    });
  }

  function seedDefaults(sections, vals) {
    sections.forEach(function (sec) {
      sec.fields.forEach(function (f) {
        if (f.value !== undefined && (vals[f.id] === undefined || vals[f.id] === "")) vals[f.id] = f.value;
        if (f.type === "select" && !f.required && vals[f.id] === undefined) vals[f.id] = "";
      });
    });
    if (!vals.currency) vals.currency = CONFIG.currencyDefault;
    return vals;
  }

  function readForm(host, values, sections) {
    $$("[data-field]", host).forEach(function (n) {
      var k = n.dataset.field;
      if (n.type === "checkbox") values[k] = n.checked;
      else values[k] = n.value;
    });
    $$("[data-check]", host).forEach(function (n) {
      var arr = values[n.dataset.check] || (values[n.dataset.check] = []);
      var i = arr.indexOf(n.dataset.val);
      if (n.checked && i < 0) arr.push(n.dataset.val);
      if (!n.checked && i >= 0) arr.splice(i, 1);
    });
    normaliseTel(host, values);
    return values;
  }

  function paintErrors(host, errors) {
    $$(".field", host).forEach(function (fd) {
      var id = fd.dataset.field, msg = errors[id];
      fd.classList.toggle("bad", !!msg);
      var e = $(".err .em", fd); if (e) e.textContent = msg || "";
      if (fd.classList.contains("consent")) fd.classList.toggle("bad", !!msg);
      var c = fd.querySelector(".consent"); if (c) c.classList.toggle("bad", !!msg);
      var inp = $(".inp", fd); if (inp) { if (msg) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid"); }
    });
  }

  /* ══════════════ 4. APPLY WIZARD ═════════════════════════════════════ */
  var SECTIONS = FORMS.apply;
  var values = {};
  var step = 0;
  var DRAFT = "jcrgm_welfare_draft_v1";

  function allFields(list) { var a = []; list.forEach(function (s) { a = a.concat(s.fields); }); return a; }
  var APPLY_FIELDS = allFields(SECTIONS);

  function paintSteps() {
    var h = $("#applySteps"); h.innerHTML = "";
    SECTIONS.forEach(function (s, i) {
      var li = el("li", i < step ? "done" : i === step ? "now" : null,
        "<b></b><em>" + esc(s.title) + "</em>");
      li.title = s.title;
      h.appendChild(li);
    });
  }

  function paintStep(scroll) {
    var s = SECTIONS[step];
    $("#applyStepTitle").textContent = s.title;
    $("#applyStepNote").textContent = step === SECTIONS.length - 1
      ? "Almost done. Please read the two promises, tick them, then send."
      : "Step " + (step + 1) + " of " + SECTIONS.length + " — " + s.fields.length + " question" + (s.fields.length > 1 ? "s" : "") + ". Blank is fine for anything marked optional.";
    renderSections($("#applySections"), SECTIONS, values, "ap", step);
    paintSteps();
    $("#applyBack").hidden = step === 0;
    $("#applyNext").hidden = step === SECTIONS.length - 1;
    $("#applySubmit").hidden = step !== SECTIONS.length - 1;
    if (scroll !== false) { var y = $("#applyShell").getBoundingClientRect().top + window.scrollY - 70; window.scrollTo({ top: y, behavior: "smooth" }); }
  }

  function stepFields() { return SECTIONS[step].fields; }
  seedDefaults(SECTIONS, values);

  $("#applySections").addEventListener("input", function (e) {
    if (e.target && e.target.dataset && e.target.dataset.field === "dob") {
      var h = $('#applySections [data-hint="dob"]');
      if (h) {
        var a = W.ageFromDob(e.target.value);
        h.innerHTML = a === null ? "" : (a < 18
          ? "\u26a0\ufe0f <b>Age " + a + " \u2014 a minor.</b> A parent or guardian must consent below, and a guardian's phone is required."
          : "Age " + a + " \u00b7 born " + nice(e.target.value));
        h.style.color = a !== null && a < 18 ? "var(--violet)" : "";
      }
    }
  });
  $("#applySections").addEventListener("input", debounce(function (e) {
    readForm($("#applySections"), values, SECTIONS);
    if (e.target.matches("[data-field]")) {
      var fd = e.target.closest(".field");
      if (fd && fd.classList.contains("bad")) {
        var one = W.validate(values, [stepFields().find(function (f) { return f.id === e.target.dataset.field; }) || { id: "x" }]);
        if (!one.errors[e.target.dataset.field]) fd.classList.remove("bad");
      }
    }
    saveDraft();
  }, 260));
  $("#applySections").addEventListener("change", function (e) {
    if (e.target.matches("[data-check]")) {
      var lab = e.target.closest(".chip"); if (lab) lab.classList.toggle("on", e.target.checked);
    }
    if (e.target.matches("[data-field]")) {
      if (e.target.type === "checkbox") { var c = e.target.closest(".consent"); if (c) c.classList.toggle("on", e.target.checked); }
    }
    readForm($("#applySections"), values, SECTIONS);
    saveDraft();
  });

  function saveDraft() {
    try { localStorage.setItem(DRAFT, JSON.stringify({ v: values, s: step, t: Date.now() })); } catch (e) {}
  }
  function loadDraft() {
    try {
      var d = JSON.parse(localStorage.getItem(DRAFT) || "null");
      if (d && d.v) { values = d.v; step = Math.min(d.s || 0, SECTIONS.length - 1); return true; }
    } catch (e) {}
    return false;
  }

  $("#applyNext").addEventListener("click", function () {
    readForm($("#applySections"), values, SECTIONS);
    var r = W.validate(values, stepFields());
    paintErrors($("#applySections"), r.errors);
    if (!r.ok) {
      toast(r.count + (r.count === 1 ? " answer needs" : " answers need") + " fixing before we continue.", "warn", "Not yet");
      var bad = $("#" + "ap" + step + "-" + r.firstBad) || $("[data-field='" + r.firstBad + "']", $("#applySections"));
      if (bad) { bad.focus(); bad.scrollIntoView({ block: "center", behavior: "smooth" }); }
      return;
    }
    step = Math.min(step + 1, SECTIONS.length - 1);
    paintStep(); saveDraft();
  });
  $("#applyBack").addEventListener("click", function () {
    readForm($("#applySections"), values, SECTIONS);
    step = Math.max(step - 1, 0); paintStep(); saveDraft();
  });
  $("#applySave").addEventListener("click", function () {
    readForm($("#applySections"), values, SECTIONS); saveDraft();
    toast("Saved on this phone. Nothing has been sent yet — come back to this page and it will still be here.", "info", "Draft kept");
  });

  $("#applyForm").addEventListener("submit", function (e) {
    e.preventDefault();
    readForm($("#applySections"), values, SECTIONS);
    normaliseTel($("#applySections"), values);
    var r = W.validate(values, APPLY_FIELDS);
    if (!r.ok) {
      // jump to the first section containing an error
      for (var i = 0; i < SECTIONS.length; i++) {
        if (SECTIONS[i].fields.some(function (f) { return r.errors[f.id]; })) { step = i; paintStep(false); break; }
      }
      paintErrors($("#applySections"), r.errors);
      toast(r.count + " required " + (r.count === 1 ? "answer is" : "answers are") + " still missing.", "err", "Cannot send yet");
      return;
    }
    submitApplication();
  });

  function submitApplication() {
    var btn = $("#applySubmit"); busy(btn, true, "Sending…");
    var rec = W.blankRecord("application");
    Object.keys(values).forEach(function (k) { rec[k] = values[k]; });
    rec.created_by = "public-form";
    rec.assigned_to = ""; rec.status = "submitted"; rec.priority = values.urgency === "critical" ? "critical" : "normal";
    DB.create(rec).then(function (saved) {
      busy(btn, false);
      try { localStorage.removeItem(DRAFT); } catch (e) {}
      values = seedDefaults(SECTIONS, W.blankRecord("application"));
      step = 0; paintStep(false);
      paintMode(); refreshBadge();
      showReceipt(saved);
      toast(saved._synced ? "Received. Your case is now in the church register." :
        "Received and kept safely on this phone. It will upload automatically once the database is connected.",
        "ok", "Reference " + saved.ref_no);
    }).catch(function (err) {
      busy(btn, false);
      toast("Something blocked the send: " + ((err && err.message) || err) + ". Try again, or hand the form to the desk after service.", "err", "Not sent");
    });
  }

  function waLink(text) {
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
  }

  function showReceipt(rec) {
    var box = $("#applyDone");
    $("#applyShell").hidden = true;
    box.hidden = false;
    var minor = W.isMinor(rec.dob);
    box.innerHTML =
      '<div class="done">' +
        '<div class="halo" aria-hidden="true">🕊</div>' +
        "<h2>Your request has reached the desk</h2>" +
        "<p>The Support Team reviews new cases " + esc(CONFIG.officeHours.toLowerCase()) + ". Keep this reference — it is the only way to check on your case, and the office will ask for it.</p>" +
        '<div class="refcard">' +
          '<div class="rl">Your reference number</div>' +
          '<div class="rv" id="refVal">' + esc(rec.ref_no) + "</div>" +
          '<div class="rn">' + esc(W.category(rec.category).ico + " " + W.category(rec.category).label) + " · " +
            esc(W.status(rec.status).label) + " · filed " + esc(nice(rec.created_at)) + "</div>" +
          '<div class="rc">' +
            '<button class="btn ghost xs" type="button" id="refCopy">📋 Copy</button>' +
            '<button class="btn ghost xs" type="button" id="refSave">💾 Save as text</button>' +
            '<a class="btn ghost xs" target="_blank" rel="noopener" href="' + esc(waLink(
              "Greetings, I have just submitted a welfare request to the JCRGM Support Team.\n" +
              "Reference: " + rec.ref_no + "\nName: " + (rec.beneficiary_name || "") + "\nNeed: " + W.category(rec.category).label +
              "\nAmount: " + W.formatMoney(rec.amount_requested, rec.currency) + "\n\nI am available on " + rec.phone + ".")) + '">💬 Send to the desk</a>' +
          "</div>" +
        "</div>" +
        (minor ? '<div class="note warn" style="text-align:left;margin-bottom:14px"><span class="ni" aria-hidden="true">🧒</span><div><b>A minor is on this file.</b> A parent or guardian will be called before anything is approved. Please keep your phone near you.</div></div>' : "") +
        (rec.urgency === "critical" ? '<div class="note danger" style="text-align:left;margin-bottom:14px"><span class="ni" aria-hidden="true">🚨</span><div><b>You marked this critical.</b> Do not wait on the form alone — call ' + esc(CONFIG.phone) + ' now or come to the church today.</div></div>' : "") +
        '<div class="note" style="text-align:left;margin-bottom:16px"><span class="ni" aria-hidden="true">⏱</span><div><b>What happens next.</b> Two team members verify the details (documents, referee call, sometimes a home visit). You will be told the outcome on this page and by phone, normally within 72 hours.</div></div>' +
        '<div class="actions">' +
          '<button class="btn primary" type="button" id="refTrack">🔎 Track this case</button>' +
          '<button class="btn ghost" type="button" id="refAnother">＋ Submit another</button>' +
          '<button class="btn ghost" type="button" id="refHome">🏠 Back to app</button>' +
        "</div>" +
        '<p class="small muted" style="margin-top:14px">Reference ' + esc(rec.ref_no) + (rec._synced ? " · stored in the church database" : " · stored on this device, waiting to sync") + "</p>" +
      "</div>";
    box.scrollIntoView({ behavior: "smooth", block: "start" });
    $("#refCopy").addEventListener("click", function () { copy(rec.ref_no, this); });
    $("#refSave").addEventListener("click", function () {
      var blob = new Blob(["JCRGM welfare request\nReference: " + rec.ref_no + "\nName: " + (rec.beneficiary_name || "") +
        "\nNeed: " + W.category(rec.category).label + "\nAmount: " + W.formatMoney(rec.amount_requested, rec.currency) +
        "\nPhone: " + rec.phone + "\nFiled: " + nice(rec.created_at) + "\n\n" + (rec.need_description || "")], { type: "text/plain" });
      dl(blob, "JCRGM-" + rec.ref_no + ".txt"); toast("Saved a text copy of your request.", "ok");
    });
    $("#refTrack").addEventListener("click", function () {
      box.hidden = true; $("#applyShell").hidden = false;
      $("#lkRef").value = rec.ref_no; $("#lkPhone").value = rec.phone || "";
      show("status"); $("#lookupForm").requestSubmit ? $("#lookupForm").requestSubmit() : $("#lkGo").click();
    });
    $("#refAnother").addEventListener("click", function () { box.hidden = true; $("#applyShell").hidden = false; step = 0; paintStep(); });
    $("#refHome").addEventListener("click", function () { location.href = "index.html"; });
  }

  function copy(text, btn) {
    function okk() { if (btn) { var o = btn.innerHTML; btn.innerHTML = "✅ Copied"; setTimeout(function () { btn.innerHTML = o; }, 1600); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(okk, fallback);
    else fallback();
    function fallback() {
      var ta = el("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); okk(); } catch (e) { toast("Long-press the number to copy it.", "warn"); }
      document.body.removeChild(ta);
    }
  }
  function dl(blob, name) {
    var a = el("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); if (a.parentNode) a.parentNode.removeChild(a); }, 900);
  }

  /* ══════════════ 5. STATUS LOOKUP ════════════════════════════════════ */
  var TIMELINE = ["submitted", "reviewing", "visit", "approved", "disbursed", "closed"];
  function timelineFor(rec) {
    var cur = TIMELINE.indexOf(rec.status);
    return TIMELINE.map(function (s, i) {
      var st = W.status(s);
      var cls = cur < 0 ? "" : i < cur ? "hit" : i === cur ? (rec.status === "declined" ? "dead" : "now") : "";
      var when = "";
      if (s === "submitted") when = "Filed " + nice(rec.created_at);
      else if (s === "disbursed" && rec.disbursed_date) when = "Released " + nice(rec.disbursed_date);
      else if (s === "approved" && rec.decision_date) when = "Decided " + nice(rec.decision_date);
      else if (i <= cur) when = "Completed";
      return { key: s, label: st.label, desc: st.desc, cls: cls, when: when, color: st.color };
    });
  }
  $("#lookupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var ref = $("#lkRef").value, phone = $("#lkPhone").value, out = $("#lookupResult");
    $("#lkRefErr").closest(".field").classList.remove("bad");
    $("#lkPhoneErr").closest(".field").classList.remove("bad");
    busy($("#lkGo"), true, "Searching…");
    DB.lookup(ref, phone).then(function (r) {
      busy($("#lkGo"), false);
      if (!r.ok) {
        var p = W.parseRef(ref);
        if (!p.ok) { var f = $("#lkRef").closest(".field"); f.classList.add("bad"); $(".err .em", f).textContent = p.reason; }
        else if (!W.isValidPhone(phone)) { var f2 = $("#lkPhone").closest(".field"); f2.classList.add("bad"); $(".err .em", f2).textContent = "Enter the phone number you applied with."; }
        out.innerHTML = '<div class="card"><div class="note danger"><span class="ni" aria-hidden="true">🔍</span><div><b>We could not open that case.</b> ' + esc(r.error) +
          "<br>If it keeps failing, the Support Team can help on <a href='tel:+" + esc(W.normalisePhone(CONFIG.phone)) + "'>" + esc(CONFIG.phone) + "</a>.</div></div></div>";
        toast("No match — check the reference and the phone number.", "warn");
        return;
      }
      r.record._fromDevice = !!r.local;
      paintCase(r.record, out, false);
      toast("Found " + r.record.ref_no + (r.local ? " on this device." : "."), r.local ? "warn" : "ok");
    }).catch(function (err) {
      busy($("#lkGo"), false);
      toast("Search failed: " + ((err && err.message) || err), "err");
    });
  });

  function paintCase(rec, host, isAdmin) {
    var st = W.status(rec.status);
    var items = timelineFor(rec);
    host.innerHTML =
      '<div class="card">' +
        '<div class="card-hd">' +
          '<span class="ico" aria-hidden="true">' + esc(W.category(rec.category).ico) + "</span>" +
          '<div class="grow"><span class="eyebrow-sm">' + esc(rec.ref_no) + "</span>" +
            "<h2>" + esc(rec.beneficiary_name || "Your case") + "</h2>" +
            '<p>' + esc(W.category(rec.category).label) + " · requested " + esc(W.formatMoney(rec.amount_requested, rec.currency)) + " · filed " + esc(nice(rec.created_at)) + "</p>" +
          "</div>" +
          '<span class="badge" style="background:' + st.color + '1f;color:' + st.color + ';border-color:' + st.color + '55">' + esc(st.label) + "</span>" +
        "</div>" +
        (rec._fromDevice
          ? '<div class="note warn" style="margin-bottom:14px"><span class="ni" aria-hidden="true">📴</span><div><b>Showing the copy saved on this phone.</b> ' +
            "We could not reach the welfare database, so this may be behind the desk's latest notes. Try again when you have data, or call the office.</div></div>"
          : "") +
        '<div class="note" style="margin-bottom:14px"><span class="ni" aria-hidden="true">📣</span><div>' +
          "<b>Message from the desk.</b> " + esc(rec.decision_notes || W.publicStatusText(rec)) + "</div></div>" +
        '<ol class="tl">' + items.map(function (t) {
          return '<li class="' + t.cls + '"><b style="' + (t.cls === "now" ? "color:" + t.color : "") + '">' + esc(t.label) + "</b>" +
                 "<span>" + esc(t.desc) + "</span>" + (t.when ? "<time>" + esc(t.when) + "</time>" : "") + "</li>";
        }).join("") + "</ol>" +
        (rec.status === "declined" ? '<div class="note warn"><span class="ni" aria-hidden="true">🙏</span><div>A decision to decline is not a judgement on you. Circumstances change, and the door stays open — you are welcome to bring a new request after three months, or to speak with a pastor in person.</div></div>' : "") +
        (rec.status === "disbursed" ? '<div class="note ok"><span class="ni" aria-hidden="true">🧾</span><div><b>Released ' + esc(W.formatMoney(rec.disbursed_amount, rec.currency)) + " on " + esc(nice(rec.disbursed_date)) + "</b>" +
          (rec.receipt_ref ? " · proof ref " + esc(rec.receipt_ref) : "") + ". Give the reference above if anything is unclear.</div></div>" : "") +
        (rec.review_date ? '<div class="note" style="margin-top:9px"><span class="ni" aria-hidden="true">📅</span><div>A follow-up review is booked for <b>' + esc(nice(rec.review_date)) + "</b>.</div></div>" : "") +
        '<div class="row" style="margin-top:14px">' +
          '<a class="btn ghost sm" target="_blank" rel="noopener" href="' + esc(waLink("Greetings. I am following up on welfare case " + rec.ref_no + ".")) + '">💬 Ask about it on WhatsApp</a>' +
          '<a class="btn ghost sm" href="tel:+' + esc(W.normalisePhone(CONFIG.phone)) + '">📞 Call ' + esc(CONFIG.phone) + "</a>" +
          '<button class="btn ghost sm" type="button" onclick="document.getElementById(\'lkRef\').value=\'\'">🔍 Search another</button>' +
        "</div>" +
      "</div>";
  }

  /* ══════════════ 6. ADMIN GATE ═══════════════════════════════════════ */
  var SES = "jcrgm_welfare_admin_v1";
  var attempts = 0, idleTimer = null, unlocked = false;

  function sessionValid() {
    try {
      var s = JSON.parse(sessionStorage.getItem(SES) || "null");
      if (!s || !s.until) return false;
      return Date.now() < s.until;
    } catch (e) { return false; }
  }
  function codeSupplied() {
    try { return sessionStorage.getItem(SES + "_code") === "ok"; } catch (e) { return false; }
  }
  function permission() {
    return (J.supabase && J.supabase.deskPermission) ? J.supabase.deskPermission() : { mode: "no-platform", allowed: true };
  }
  function needsCode() { return !(permission().mode === "church" && permission().leader); }
  function deskReady() { var p = permission(); return p.mode !== "church" ? codeSupplied() : (p.allowed && (p.leader || codeSupplied())); }

  /** Paints whichever of the three entry states applies: sign in, code, or nothing. */
  function refreshAccess() {
    var p = permission();
    if (unlocked && p.mode === "church" && !p.allowed) { closeDesk("Your church access changed, so the desk was locked."); return; }
    if (p.mode !== "church") {
      $("#lockAuthSlot").innerHTML = ""; $("#lockForm").hidden = false; paintLockFoot(p);
      // Single-factor mode: the code session IS the access, so honour its
      // expiry instead of leaving a desk open forever once it was once opened.
      if (unlocked && !sessionValid()) closeDesk("The support desk locked itself after " + CONFIG.adminSessionMinutes + " minutes of inactivity.");
      return;
    }
    if (!p.signedIn || !p.allowed) {
      $("#lockForm").hidden = true; unlocked = false;
      $("#desk").hidden = true; $("#lockCard").hidden = false;
      $("#lockAuthSlot").innerHTML =
        '<div class="note' + (p.signedIn ? " danger" : "") + '"><span class="ni" aria-hidden="true">👤</span><div>' +
        '<b>' + esc(p.label || "Sign in required") + '</b><br>' +
        (p.signedIn
          ? 'The welfare register is limited to ' + esc(CONFIG.deskRoles.join(", ")) + '. Ask a leader to set your role in <em>Announcements → Manage member access</em>.'
          : 'This desk holds confidential welfare records, so it opens for an approved church account and not for a shared code alone. The database enforces the same rule.') +
        '</div></div>' +
        (p.signedIn ? "" : '<div class="row" style="justify-content:center;margin-top:12px">' +
          '<button class="btn primary sm" type="button" data-church-signin>Sign in / request access</button>' +
          '<a class="btn ghost sm" href="announcements.html">Announcements</a></div>');
      if (!p.signedIn) { window.Church && window.Church.wireAuth && window.Church.wireAuth(); }
      paintLockFoot(p);
      return;
    }
    $("#lockAuthSlot").innerHTML = '<div class="note ok"><span class="ni" aria-hidden="true">✅</span><div><b>' +
      esc(p.name) + '</b> — approved church account' + (p.leader ? " (leader)" : " (" + esc(p.role) + ")") +
      (p.leader ? ", so no code is needed." : ", now the Support Team code.") + '</div></div>';
    $("#lockForm").hidden = !needsCode();
    paintLockFoot(p);
    if (!needsCode() && !unlocked) { try { sessionStorage.setItem(SES, JSON.stringify({ until: Date.now() + CONFIG.adminSessionMinutes * 60000, at: Date.now() })); } catch (e) {} openDesk(); }
  }
  function paintLockFoot(p) {
    $("#lockFoot").innerHTML = p.mode === "church"
      ? esc(CONFIG.unitName) + " · church sign-in" + (needsCode() ? " + team code" : " (leaders skip the code)") + " · " + esc(CONFIG.officeHours)
      : esc(CONFIG.unitName) + " · team code only (church platform not loaded here) · " + esc(CONFIG.officeHours);
  }

  function openDesk() {
    unlocked = true;
    $("#lockCard").hidden = true; $("#desk").hidden = false;
    try { sessionStorage.setItem(SES, JSON.stringify({ until: Date.now() + CONFIG.adminSessionMinutes * 60000, at: Date.now() })); } catch (e) {}
    armIdle();
    loadRegister();
    if (!S_watchOn && J.supabase.watch) {
      // Realtime is the fast path; the app's other pages also re-poll, because
      // a phone walking out of wifi coverage silently drops the socket.
      try { J.supabase.watch(function () { clearTimeout(watchT); watchT = setTimeout(function () { loadRegister(); }, 500); }); S_watchOn = true; } catch (e) {}
    }
    if (!pollTimer) pollTimer = setInterval(function () {
      if (unlocked && J.supabase.live && J.supabase.live() && J.supabase.online()) loadRegister();
    }, 20000);
  }
  function closeDesk(msg) {
    unlocked = false;
    $("#lockCard").hidden = false; $("#desk").hidden = true;
    $("#deskNotes").innerHTML = "";
    try { sessionStorage.removeItem(SES); sessionStorage.removeItem(SES + "_code"); } catch (e) {}
    clearInterval(idleTimer);
    if ($("#desk").hidden === false) refreshAccess();
    if (msg) toast(msg, "info", "Desk locked");
  }
  function armIdle() {
    clearInterval(idleTimer);
    idleTimer = setInterval(function () {
      if (!unlocked) return;
      if (!sessionValid()) { closeDesk("Session timed out for the safety of the beneficiaries. Unlock again to continue."); }
    }, 30000);
  }
  ["click", "keydown", "touchstart"].forEach(function (ev) {
    document.addEventListener(ev, debounce(function () {
      if (unlocked && sessionValid()) {
        try { sessionStorage.setItem(SES, JSON.stringify({ until: Date.now() + CONFIG.adminSessionMinutes * 60000, at: Date.now() })); } catch (e) {}
      }
    }, 1200), true);
  });

  $("#showPw").addEventListener("change", function () { $("#lockPw").type = this.checked ? "text" : "password"; });
  $("#lockForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var pw = $("#lockPw").value, box = $("#lockCard"), err = $("#lockErr");
    if (attempts >= CONFIG.maxPasswordAttempts) {
      err.hidden = false; $("#lockErrText").textContent = "Too many attempts. Close this page and try again in a few minutes.";
      box.classList.add("shake"); setTimeout(function () { box.classList.remove("shake"); }, 420);
      return;
    }
    busy($("#lockGo"), true, "Checking…");
    W.checkAdminPassword(pw).then(function (okk) {
      busy($("#lockGo"), false);
      if (okk) {
        attempts = 0; $("#lockPw").value = ""; err.hidden = true;
        /* The code is one factor, not the door. The form is normally hidden for
           anyone who is not on the desk, but a hidden form can still be
           submitted - so the role is re-checked here, at the moment of trust,
           rather than assumed from which pixels are visible. */
        var pm = permission();
        if (pm.mode === "church" && !pm.allowed) {
          refreshAccess();
          toast(pm.label + ". The code alone does not open the register — the database checks the role too.",
                "err", "Right code, wrong account", 12000);
          return;
        }
        try { sessionStorage.setItem(SES + "_code", "ok"); } catch (e) {}
        refreshAccess(); openDesk();
        toast("Welcome" + (permission().name ? ", " + permission().name : "") + ". " + DB.queueSize() + " record(s) waiting to sync.", "ok", "Desk unlocked");
      }
      else {
        attempts++;
        err.hidden = false;
        $("#lockErrText").textContent = "That password does not match. " + (CONFIG.maxPasswordAttempts - attempts) + " attempt" + (CONFIG.maxPasswordAttempts - attempts === 1 ? "" : "s") + " left before this page locks.";
        box.classList.add("bad", "shake");
        setTimeout(function () { box.classList.remove("shake"); }, 420);
        $("#lockPw").select();
      }
    });
  });
  $("#btnLock").addEventListener("click", function () { closeDesk("Desk locked."); });
  var outBtn = $("#btnOut");
  if (outBtn) {
    var showOut = function () { var p = permission(); outBtn.hidden = p.mode !== "church" || !p.signedIn; };
    showOut(); outBtn.addEventListener("click", signOut);
    window.addEventListener("church-identity", showOut);
  }

  function adminEnter() {
    paintMode(); refreshAccess();
    if (deskReady() && sessionValid() && !unlocked) openDesk();
    else if (unlocked) loadRegister();
  }

  /* ══════════════ 7. DESK: stats, register, drawer ════════════════════ */
  var S_watchOn = false, watchT = null, pollTimer = null;
  var records = [], filter = { query: "", kind: "", status: "", category: "", sort: "newest", awaitingOnly: false };

  function paintRows(rows) {
    records = rows;
    paintStats(); paintFilters(); paintRegister(); paintMode(); paintHomeStats();
  }
  function loadRegister() {
    // Paint the device's own copy immediately, then swap in the server's when
    // it answers. A desk opening on a poor connection must never sit blank for
    // the length of a network timeout, and everything it needs is already here.
    if (J.supabase.localAll) paintRows(J.supabase.localAll());
    return DB.list().then(function (rows) {
      paintRows(rows);
    }).catch(function (e) { toast("Could not open the register: " + ((e && e.message) || e), "err"); });
  }

  function statBox(n, label, cls) { return '<div class="stat ' + (cls || "") + '"><b>' + esc(n) + "</b><span>" + esc(label) + "</span></div>"; }

  /* The tab badge updates after every write. It reads the LOCAL mirror on
     purpose, not the server list: DB.list() waits on a round-trip, and on a
     phone with one bar of signal that could leave the count stale for half a
     minute - or freeze the public page the applicant just landed on. The
     mirror always carries the record just typed, queued or not; the desk's own
     register does the authoritative (merged) read when it opens. */
  function refreshBadge() {
    var localRead = J.supabase.localAll
      ? Promise.resolve(J.supabase.localAll())
      : DB.list();
    localRead.then(function (rows) {
      var s2 = W.summarise(rows), b = $("#badgeAwaiting");
      b.hidden = s2.awaiting === 0;
      b.textContent = s2.awaiting;
      b.className = "tab-badge" + (s2.awaiting > 0 ? " hot" : "");
      b.title = s2.awaiting + " case(s) waiting for the Support Team";
      var hb = $("#homeStats [data-await]");
    }).catch(function () {});
  }
  function paintHomeStats() {
    DB.list().then(function (rows) {
      var s = W.summarise(rows);
      $("#homeStats").innerHTML =
        statBox(s.sponsored, "Registered for sponsorship") +
        statBox(s.active, "Receiving help now", "is-ok") +
        statBox(W.formatMoney(s.disbursedTotal, CONFIG.currencyDefault), "Assistance released", "is-gold") +
        statBox(s.awaiting, "Awaiting the desk", s.awaiting > 0 ? "is-warn" : "");
      refreshBadge();
    }).catch(function () {});
  }

  function paintStats() {
    var s = W.summarise(records);
    $("#deskStats").innerHTML =
      statBox(s.total, "Cases on file") +
      statBox(s.sponsored, "Sponsored people") +
      statBox(s.applied, "Applications") +
      statBox(s.awaiting, "Awaiting action", s.awaiting ? "is-warn" : "") +
      statBox(s.active, "Active support", "is-ok") +
      statBox(W.formatMoney(s.requestedTotal, CONFIG.currencyDefault), "Requested") +
      statBox(W.formatMoney(s.disbursedTotal, CONFIG.currencyDefault), "Disbursed", "is-gold") +
      statBox(W.formatMoney(s.committedMonthly, CONFIG.currencyDefault), "Committed monthly", "is-gold") +
      statBox(s.minors, "Minors on file", s.minors ? "is-warn" : "") +
      statBox(s.critical, "Critical urgency", s.critical ? "is-warn" : "");
    var n = $("#deskNotes");
    var bits = [];
    var online = !J.supabase.online || J.supabase.online();
    if (!DB.live()) bits.push('<div class="note warn" style="flex:1 1 320px"><span class="ni" aria-hidden="true">📴</span><div><b>Running on this device only.</b> ' + DB.queueSize() +
      " record(s) are waiting to upload. This portal reads the church app's own project (supabase-config.js); run supabase-schema.sql there and every phone shares one register. To keep welfare in its own database instead, put that URL and publishable key in <span class='mono'>jcrgm-config.js</span>.</div></div>");
    else if (!online) bits.push('<div class="note warn" style="flex:1 1 320px"><span class="ni" aria-hidden="true">📡</span><div><b>No connection right now.</b> The list below is the last copy this phone received, so it may be behind the others. New entries queue here and upload themselves when signal returns.</div></div>');
    else bits.push('<div class="note ok" style="flex:1 1 320px"><span class="ni" aria-hidden="true">🛰</span><div><b>Live with the church database.</b> Anything saved here appears on every phone in the app within seconds.</div></div>');
    var pending = records.filter(function (r) { return r._pending || r._syncError; });
    if (J.supabase.lastListError) bits.push('<div class="note danger" style="flex:1 1 320px"><span class="ni" aria-hidden="true">👀</span><div><b>This is the copy on this phone — the church register could not be read.</b> ' +
      esc(J.supabase.lastListError) +
      '<br>A Support Team member who cannot read the register cannot write to it either: check that this account is approved and holds one of the roles in <span class="mono">' + esc(CONFIG.deskRoles.join(", ")) +
      '</span> (Announcements → Manage member access), and that <span class="mono">supabase-schema.sql</span> has been run whole in this project.</div></div>');
    if (pending.length) {
      var why = pending.map(function (r) { return { ref: r.ref_no, why: r._syncError || (J.supabase.unsavedReason ? J.supabase.unsavedReason(r.id) : "") || "no row was updated" }; });
      bits.push('<div class="note danger" style="flex:1 1 320px"><span class="ni" aria-hidden="true">⛔</span><div><b>' + pending.length +
        " change(s) are on this phone only — the database did not accept them.</b>" +
        '<ul style="margin:6px 0 0;padding-left:18px">' + why.slice(0, 4).map(function (w) {
          return '<li><span class="mono">' + esc(w.ref) + '</span>: ' + esc(w.why) + '</li>';
        }).join("") + (why.length > 4 ? '<li>…and ' + (why.length - 4) + ' more</li>' : "") + '</ul>' +
        '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn ghost xs" type="button" id="btnReplay">Retry the ' + pending.length +
        ' change(s)</button><button class="btn ghost xs" type="button" id="btnDiag">Check the connection</button></div>' +
        '<div id="diagOut" class="sub" style="margin-top:6px"></div></div></div>');
    }
    var stale = records.filter(function (r) { return W.isAwaitingAdmin(r) && (W.daysSince(r.created_at) || 0) > 7; });
    if (stale.length) bits.push('<div class="note danger" style="flex:1 1 320px"><span class="ni" aria-hidden="true">⏰</span><div><b>' + stale.length +
      " case(s) have waited over a week.</b> Someone should ring those families this week — a delay is its own kind of answer.</div></div>");
    n.innerHTML = bits.join("");
    function diagHtml(r) {
      return (r.checks || []).map(function (k) {
        return '<div>' + (k.pass ? "✓ " : "✗ ") + esc(k.name) + (!k.pass && k.fix ? " (" + esc(k.fix) + ")" : "") + '</div>';
      }).join("") + (r.advice ? '<div><b>' + esc(r.advice) + '</b></div>' : "");
    }
    /* a diagnosis must outlive the repaint that a Sync or a Retry triggers */
    if (J.supabase.lastSelfTest) {
      var dgo = $("#diagOut");
      if (dgo) { dgo.innerHTML = diagHtml(J.supabase.lastSelfTest); dgo.setAttribute("data-verdict", J.supabase.lastSelfTest.verdict || ""); }
    }
    var dg = $("#btnDiag");
    if (dg) dg.addEventListener("click", function () {
      dg.disabled = true; dg.textContent = "Checking…";
      var undo = function () { dg.disabled = false; dg.textContent = "Check the connection"; };
      (J.supabase.selfTest ? J.supabase.selfTest() : Promise.resolve({ verdict: "unknown", advice: "", checks: [] }))
        .then(function (r) {
          undo();
          var o = $("#diagOut");
          if (o) o.innerHTML = diagHtml(r);
          if (r.ok) {
            toast("Everything checks out: the database counts this connection as Support Team. Retry should now write.",
                  "ok", "Connection is fine", 11000);
            loadRegister();
          } else {
            toast(r.advice || "The check found nothing to report.", "err", "Found: " + r.verdict, 16000);
          }
        }, function (e) {
          /* the button must never be left spinning because a check went wrong */
          undo();
          toast("The check itself could not finish: " + ((e && e.message) || e) + ". Nothing on this page was changed.", "err", "Check failed", 12000);
        });
    });
    var rp = $("#btnReplay");
    if (rp) rp.addEventListener("click", function () {
      rp.disabled = true; rp.textContent = "Retrying…";
      (DB.replayPending ? DB.replayPending() : Promise.resolve({ written: 0, still: 0 })).then(function (r) {
        rp.disabled = false; rp.textContent = "Retry the unsaved change(s)";
        if (r.written && !r.still) { toast("All " + r.written + " change(s) are now in the church database.", "ok", "Written"); }
        else if (r.written) { toast(r.written + " written, " + r.still + " still refused: " + r.reason, "warn", "Partly written"); }
        else { toast("Still refused: " + (r.reason || "the account cannot write to " + CONFIG.tableName + "."), "err", "Not written", 14000); }
        loadRegister();
      });
    });
  }

  function paintFilters() {
    var st = $("#fStatus"), ct = $("#fCat");
    if (st.options.length < 2) {
      st.innerHTML = '<option value="">Any status</option>' + CONFIG.statuses.map(function (s) {
        var n = records.filter(function (r) { return r.status === s.id; }).length;
        return '<option value="' + s.id + '">' + esc(s.label) + (n ? " (" + n + ")" : "") + "</option>";
      }).join("");
      ct.innerHTML = '<option value="">Any category</option>' + CONFIG.categories.map(function (c) {
        var n = records.filter(function (r) { return r.category === c.id; }).length;
        return '<option value="' + c.id + '">' + esc(c.label) + (n ? " (" + n + ")" : "") + "</option>";
      }).join("");
    } else {
      $$("option", st).forEach(function (o) {
        if (!o.value) return;
        var n = records.filter(function (r) { return r.status === o.value; }).length;
        o.textContent = W.status(o.value).label + (n ? " (" + n + ")" : "");
      });
    }
  }

  function currentRows() { return W.filterRecords(records, filter); }

  /* Deleting is the leader's call in the schema ("jcrgm desk delete"), and a
     policy-filtered DELETE comes back as 204 with no rows - indistinguishable
     from success unless you know the rule. So the desk states the rule. */
  function canDelete() {
    try { var pm = permission(); return !!(pm && (pm.leader || pm.mode === "no-platform" || pm.mode === "not-configured")); }
    catch (e) { return true; }
  }
  function rowBadges(r) {
    var b = [];
    if (r.priority === "critical" || r.urgency === "critical") b.push('<span class="badge tone-danger">Critical</span>');
    if (W.isMinor(r.dob)) b.push('<span class="badge tone-violet">Minor</span>');
    if (r.kind === "sponsorship") b.push('<span class="badge tone-teal">Sponsored</span>');
    if ((W.daysSince(r.created_at) || 0) > 7 && W.isAwaitingAdmin(r)) b.push('<span class="badge tone-warn">' + W.daysSince(r.created_at) + "d waiting</span>");
    if (r._offline) b.push('<span class="badge tone-gold">On device</span>');
    if (r._pending || r._syncError) b.push('<span class="badge tone-danger" title="' + esc(r._syncError || "not written") + '">Not written</span>');
    return b.join(" ");
  }
  function stBadge(r) {
    var s = W.status(r.status);
    return '<span class="badge" style="background:' + s.color + '1c;color:' + s.color + ';border-color:' + s.color + '55">' + esc(s.label) + "</span>";
  }

  function paintRegister() {
    var rows = currentRows(), host = $("#registerView");
    $("#regCount").textContent = rows.length + " of " + records.length + " case" + (records.length === 1 ? "" : "s") +
      (filter.query ? ' matching “' + filter.query + '”' : "");
    if (!rows.length) {
      host.innerHTML = '<div class="empty"><span class="ei" aria-hidden="true">' + (records.length ? "🔍" : "🕊") + "</span>" +
        "<h3>" + (records.length ? "Nothing matches that filter" : "The register is empty") + "</h3>" +
        "<p>" + (records.length ? "Loosen the search, or clear the type and status filters to see everything."
          : "As soon as a beneficiary is registered here, or a member applies through the \"Apply for Help\" tab, the file will appear in this list.") + "</p></div>";
      return;
    }
    var wide = window.matchMedia("(min-width:760px)").matches;
    if (wide) {
      host.innerHTML = '<div class="tbl-scroll"><table class="reg"><thead><tr>' +
        ["Ref", "Beneficiary", "Need", "Status", "Amount", "Sponsor / referee", "Where", "Filed", ""].map(function (h) {
          return "<th>" + esc(h) + "</th>";
        }).join("") + "</tr></thead><tbody>" + rows.map(function (r) {
          var c = W.category(r.category);
          return '<tr data-open="' + esc(r.id) + '" tabindex="0">' +
            '<td class="ref">' + esc(r.ref_no) + "</td>" +
            '<td><span class="nm">' + esc(r.beneficiary_name || "—") + "</span>" +
              '<span class="sub">' + esc([W.ageFromDob(r.dob) != null ? W.ageFromDob(r.dob) + " yrs" : "", r.gender, W.isMinor(r.dob) ? "minor" : ""].filter(Boolean).join(" · ")) + "</span></td>" +
            "<td>" + esc(c.ico) + " " + esc(c.label) + (r.urgency === "critical" ? ' <span class="badge tone-danger">urgent</span>' : "") + "</td>" +
            "<td>" + stBadge(r) + (rowBadges(r) ? "<span class='sub' style='display:flex;gap:4px;margin-top:4px;flex-wrap:wrap'>" + rowBadges(r) + "</span>" : "") + "</td>" +
            '<td class="num">' + esc(W.formatMoney(r.amount_requested, r.currency)) + (r.disbursed_amount ? '<span class="sub">paid ' + esc(W.formatMoney(r.disbursed_amount, r.currency)) + "</span>" : "") + "</td>" +
            '<td><span class="nm" style="font-weight:700">' + esc(r.sponsor_name || r.referenced_by || "—") + "</span>" +
              '<span class="sub">' + esc(r.sponsor_name ? "sponsor" : "referee") + (r.sponsor_membership_no ? " · " + esc(r.sponsor_membership_no) : "") + "</span></td>" +
            '<td>' + esc([r.compound, r.city].filter(Boolean).join(", ") || "—") + '<span class="sub">' + esc(r.congregation || "") + "</span></td>" +
            '<td><span class="sub" style="font-weight:700">' + esc(ago(r.created_at)) + "</span></td>" +
            '<td class="nowrap"><button class="btn ghost xs" type="button">Open ›</button></td></tr>';
        }).join("") + "</tbody></table></div>";
    } else {
      host.innerHTML = '<div class="recs" style="padding:0 16px 16px">' + rows.map(function (r) {
        var c = W.category(r.category);
        return '<button class="rec' + (r.urgency === "critical" ? " is-critical" : "") + (W.isMinor(r.dob) ? " is-minor" : "") +
          '" type="button" data-open="' + esc(r.id) + '">' +
          '<span class="rico" aria-hidden="true">' + esc(c.ico) + "</span>" +
          '<span class="rb"><span class="rt"><b>' + esc(r.beneficiary_name || "—") + "</b>" + stBadge(r) + "</span>" +
          '<span class="rm mono">' + esc(r.ref_no) + " · " + esc(c.label) + "<br>" + esc([r.compound, r.city].filter(Boolean).join(", ") || "") + "</span>" +
          (rowBadges(r) ? '<span class="row" style="margin-top:6px;gap:5px">' + rowBadges(r) + "</span>" : "") + "</span>" +
          '<span class="rd"><span class="amt">' + esc(W.formatMoney(r.amount_requested, r.currency)) + "</span>" +
          '<span class="ago">' + esc(ago(r.created_at)) + "</span></span></button>";
      }).join("") + "</div>";
    }
  }

  $("#registerView").addEventListener("click", function (e) {
    var n = e.target.closest("[data-open]"); if (n) openCase(n.dataset.open);
  });
  $("#registerView").addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var n = e.target.closest("[data-open]"); if (n) { e.preventDefault(); openCase(n.dataset.open); }
  });

  ["#fQuery", "#fKind", "#fStatus", "#fCat", "#fSort"].forEach(function (sel) {
    $(sel).addEventListener("input", debounce(function () {
      filter.query = $("#fQuery").value.trim();
      filter.kind = $("#fKind").value; filter.status = $("#fStatus").value;
      filter.category = $("#fCat").value; filter.sort = $("#fSort").value;
      paintRegister();
    }, sel === "#fQuery" ? 200 : 0));
  });
  $("#fAwait").addEventListener("click", function () {
    filter.awaitingOnly = !filter.awaitingOnly;
    this.setAttribute("aria-pressed", filter.awaitingOnly ? "true" : "false");
    this.classList.toggle("primary", filter.awaitingOnly);
    this.classList.toggle("ghost", !filter.awaitingOnly);
    paintRegister();
  });
  window.addEventListener("resize", debounce(paintRegister, 320));

  /* ───────────────────────── drawer: the case file ───────────────────── */
  var openId = null;
  function closeDrawer() {
    $("#drawer").classList.remove("show"); $("#scrim").classList.remove("show");
    setTimeout(function () { $("#drawer").hidden = true; $("#scrim").hidden = true; }, 300);
    openId = null;
    var o = $('[data-open="' + lastFocusId + '"]'); if (o) o.focus();
  }
  var lastFocusId = null;
  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("#drawer").hidden) closeDrawer(); });

  function dlBlock(title, pairs) {
    var rows = pairs.filter(function (p) { return p[1] !== "" && p[1] != null; });
    if (!rows.length) return "";
    return '<div class="dsec"><h4>' + esc(title) + "</h4><dl class=\"dl two\">" + rows.map(function (p) {
      return "<div><dt>" + esc(p[0]) + "</dt><dd" + (p[2] ? ' class="' + p[2] + '"' : "") + ">" + esc(p[1]) + "</dd></div>";
    }).join("") + "</dl></div>";
  }

  function openCase(id) {
    var r = records.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    lastFocusId = id; openId = id;
    var c = W.category(r.category), st = W.status(r.status), age = W.ageFromDob(r.dob);
    $("#drawerTitle").textContent = r.beneficiary_name || "Untitled case";
    $("#drawerSub").innerHTML = '<span class="mono">' + esc(r.ref_no) + "</span>" + stBadge(r) +
      '<span class="badge soft">' + esc(r.kind === "sponsorship" ? "Sponsorship register" : "Public application") + "</span>" +
      (r._offline ? '<span class="badge tone-gold">on this device</span>' : '<span class="badge tone-ok">in the church database</span>');

    var body = $("#drawerBody");
    body.innerHTML =
      '<div class="note' + (r.urgency === "critical" ? " danger" : "") + '" style="margin-bottom:12px"><span class="ni" aria-hidden="true">' + esc(c.ico) + "</span><div>" +
        "<b>" + esc(c.label) + " · " + esc(r.urgency || "normal") + " urgency · " +
        esc(W.formatMoney(r.amount_requested, r.currency)) + (r.period_months > 1 ? " over " + esc(r.period_months) + " months" : "") + "</b><br>" +
        "Filed " + esc(nice(r.created_at)) + " (" + esc(ago(r.created_at)) + ") by " + esc(r.created_by || "desk") +
        (r.assigned_to ? " · owned by <b>" + esc(r.assigned_to) + "</b>" : " · unassigned") +
      "</div></div>" +
      (r.need_description ? '<div class="prose" style="margin-bottom:12px">' + esc(r.need_description) + "</div>" : "") +
      (r.vulnerability && r.vulnerability.length ? '<div class="row" style="margin-bottom:12px">' + r.vulnerability.map(function (v) { return '<span class="badge tone-warn">' + esc(v) + "</span>"; }).join("") + "</div>" : "") +
      dlBlock("🧍 Beneficiary", [
        ["Also called", r.preferred_name], ["Date of birth", r.dob ? nice(r.dob) + (age != null ? " (" + age + ")" : "") : ""],
        ["Gender", r.gender], ["Nationality", r.nationality], ["NRC", r.beneficiary_nrc],
        ["Care situation", r.orphan_status], ["Marital status", r.marital_status],
        ["Household", r.household_size ? r.household_size + " people" : ""],
        ["Dependants", r.dependants || ""], ["Employment", r.employment_status], ["ORSAN / NGO", r.orsan_number]
      ]) +
      dlBlock("📍 Reach them", [
        ["Phone", r.phone], ["Alternate", r.alt_phone], ["Email", r.email],
        ["Compound / ward", r.compound], ["City", r.city], ["Province", r.province],
        ["Physical", r.physical_address], ["Landmark", r.nearest_landmark],
        ["Congregation", r.congregation], ["Member since", r.member_since], ["Vouched for by", r.referenced_by]
      ]) +
      dlBlock("💛 Sponsor & funding", [
        ["Sponsor", r.sponsor_name], ["Relationship", r.sponsor_relation], ["Membership no.", r.sponsor_membership_no],
        ["Sponsor phone", r.sponsor_phone], ["Sponsor email", r.sponsor_email],
        ["Pledged total", r.sponsor_pledge_total ? W.formatMoney(r.sponsor_pledge_total, r.currency) : ""],
        ["Monthly pledge", r.sponsor_pledge_monthly ? W.formatMoney(r.sponsor_pledge_monthly, r.currency) : ""],
        ["Model", r.support_type], ["Starts", r.start_date ? nice(r.start_date) : ""], ["Ends", r.end_date ? nice(r.end_date) : ""],
        ["Delivery", r.disbursement_method], ["Account / till", r.disbursement_account],
        ["Bank", r.bank_name], ["Account no.", r.account_number],
        ["Institution", r.institution_name], ["Institution contact", r.institution_contact], ["Facility", r.facility_name]
      ]) +
      dlBlock("🗂 Vetting & consent", [
        ["Documents sighted", (r.documents || []).join(", ")],
        ["Data consent", r.consent_data ? "Given" : "MISSING"],
        ["Guardian consent", r.consent_minor ? "Given" : (age != null && age < 18 ? "REQUIRED — not given" : "n/a")],
        ["Photo consent", r.consent_photo ? "Given" : "Not given"],
        ["Declaration", r.declaration ? "Signed" : "MISSING"]
      ]) +
      '<div class="dsec"><h4>🛡 Support Team actions</h4>' +
        '<p class="hint" style="margin:0 0 9px">Move the case with the buttons below — every move is stamped with the date and written into the applicant\'s own status view. Payment fields are only shown to this desk.</p>' +
        '<div class="stepper" id="stSteper">' + CONFIG.statuses.map(function (s) {
          return '<button type="button" data-st="' + s.id + '"' + (r.status === s.id ? ' class="on" style="background:' + s.color + ';color:#fff"' : "") + ">" +
                 esc(s.label) + "</button>";
        }).join("") + "</div>" +
        '<div class="inline-form two" style="margin-top:12px">' +
          fld("assigned_to", "Assigned to", r.assigned_to, "text") +
          fld("priority", "Priority", r.priority, "select", ["normal", "high", "critical"]) +
          '<div class="span2">' + fld("admin_notes", "Internal case notes (never shown to the applicant)", r.admin_notes, "area") + "</div>" +
          '<div class="span2">' + fld("decision_notes", "Decision letter to applicant / sponsor", r.decision_notes, "area") + "</div>" +
          fld("decision_date", "Decision date", r.decision_date, "date") +
          fld("review_date", "Next review", r.review_date, "date") +
          fld("disbursed_amount", "Amount disbursed", r.disbursed_amount, "number") +
          fld("disbursed_date", "Date disbursed", r.disbursed_date, "date") +
          fld("receipt_ref", "Receipt / proof reference", r.receipt_ref, "text") +
          fld("disbursement_account", "Paid to (account / till)", r.disbursement_account, "text") +
        "</div>" +
        '<div class="row" style="margin-top:12px"><button class="btn primary sm" type="button" id="dSave"><span class="sp"></span><span class="lb">💾 Save this case</span></button>' +
        '<button class="btn ghost sm" type="button" id="dWa">💬 WhatsApp applicant</button>' +
        '<button class="btn ghost sm" type="button" id="dCall">📞 Call</button>' +
        '<button class="btn ghost sm" type="button" id="dPrint">🖨 Print file</button>' +
        '<span class="grow"></span><button class="btn danger xs" type="button" id="dDel"' +
      (canDelete() ? '' : ' aria-disabled="true" title="Deleting a case file needs a leadership role; closing the case keeps the record.">') +
      '>🗑 Delete</button></div>' +
        '<p class="hint" style="margin-top:9px">Last updated ' + esc(nice(r.updated_at)) + " · " + esc(ago(r.updated_at)) + "</p>" +
      "</div>" +
      '<div class="dsec"><h4>🧭 Case history</h4><ol class="tl">' + timelineFor(r).map(function (t) {
        return '<li class="' + t.cls + '"><b>' + esc(t.label) + "</b><span>" + esc(t.desc) + "</span></li>";
      }).join("") + "</ol></div>";

    $("#drawerFoot").innerHTML =
      '<span class="count">' + esc(r.ref_no) + "</span><span class='grow'></span>" +
      '<button class="btn ghost xs" type="button" id="dPrev">‹ Prev</button>' +
      '<button class="btn ghost xs" type="button" id="dNext">Next ›</button>';

    $("#drawer").hidden = false; $("#scrim").hidden = false;
    requestAnimationFrame(function () { $("#drawer").classList.add("show"); $("#scrim").classList.add("show"); });
    $("#drawerClose").focus();

    /* stepper */
    $("#stSteper").addEventListener("click", function (e) {
      var b = e.target.closest("[data-st]"); if (!b) return;
      $$("#stSteper button").forEach(function (x) { x.className = ""; x.style.background = ""; x.style.color = ""; });
      b.className = "on"; b.style.background = W.status(b.dataset.st).color; b.style.color = "#fff";
      var box = $('[name="status"]', body);            // keep a hidden mirror in sync
      if (box) { box.value = b.dataset.st; }
      // A tap on a stage is the decision, not a note to self: save it at once.
      // (Silently marking an inner field and waiting for Save is what made the
      // desk look dead.) Payment rules still apply inside saveCase.
      // Re-tapping the stage a case already sits on is not a change, so it does
      // not write anything and does not nag about it.
      if (b.dataset.st === r.status) { toast("This case is already “" + W.status(b.dataset.st).label + "”.", "info"); return; }
      saveCase();
    });
    function fldVal(id) { var n = $('[name="' + id + '"]', body); return n ? n.value : ""; }

    function saveCase() {
      var chosen = $("#stSteper .on");
      var patch = {
        status: chosen ? chosen.dataset.st : r.status,
        assigned_to: W.sanitise(fldVal("assigned_to")),
        priority: fldVal("priority") || "normal",
        admin_notes: W.sanitise(fldVal("admin_notes")),
        decision_notes: W.sanitise(fldVal("decision_notes")),
        decision_date: fldVal("decision_date"), review_date: fldVal("review_date"),
        disbursed_amount: Number(fldVal("disbursed_amount")) || "",
        disbursed_date: fldVal("disbursed_date"),
        receipt_ref: W.sanitise(fldVal("receipt_ref")),
        disbursement_account: W.sanitise(fldVal("disbursement_account"))
      };
      if (patch.status === "disbursed" && !patch.receipt_ref) {
        toast("Record a receipt or proof reference before marking assistance as given.", "err", "Cannot save");
        return;
      }
      /* A disbursement with no amount would go out as null - the register would
         say "released" and K0.00 - so it is caught here, where the desk can fix
         it, rather than in the money column of a spreadsheet three weeks later. */
      if (patch.status === "disbursed" && !(Number(patch.disbursed_amount) > 0)) {
        toast("Enter the amount actually disbursed, down to the kwacha, before marking assistance as given.",
              "err", "Cannot save");
        markFieldBad(body, "disbursed_amount");
        return;
      }
      if ((patch.status === "approved" || patch.status === "declined") && !patch.decision_notes) {
        toast("Write the decision letter first — the applicant sees exactly that text.", "warn", "One thing missing");
      }
      busy($("#dSave"), true, "Saving…");
      DB.update(r.id, patch).then(function (res) {
        busy($("#dSave"), false);
        if (res && res.synced) {
          toast("Saved to the church database — every phone running the app now sees this.", "ok", r.ref_no);
          return loadRegister().then(function () { closeDrawer(); refreshBadge(); });
        }
        var why = (res && res.reason) || "the change is held on this device only.";
        // Point at the box, not just at the problem.
        if (res && res.code && /22007|22P02/.test(res.code)) markFieldBad(body, res.detail || why);
        else if (res && res.badField) markFieldBad(body, why);
        // The row stays visible with its attempted change, marked, so the desk
        // is never left wondering whether the click did anything.
        toast(why, "err", "Not written to the database", 14000);
        return loadRegister().then(refreshBadge);
      }).catch(function (e) { busy($("#dSave"), false); toast("Save failed: " + ((e && e.message) || e), "err"); });
    }
    $("#dSave").addEventListener("click", saveCase);
    /* Points at the box that caused a refusal. Takes either a field id, or the
       sentence the engine produced, and works out which box that sentence
       means. Silent when it cannot tell - guessing at a field is worse than
       saying nothing. */
    function markFieldBad(scope, textOrId) {
      var txt = String(textOrId == null ? "" : textOrId);
      var bare = /^[a-z][a-z0-9_]*$/.test(txt) && !/\s/.test(txt);
      var id = bare ? txt : null;
      var text = id ? (W.fieldLabels[id] || id) : txt;
      if (!id) {
        Object.keys(W.fieldLabels || {}).some(function (k) {
          if (text.indexOf(W.fieldLabels[k]) >= 0) { id = k; return true; }
          return false;
        });
      }
      if (!id) {
        var m = /\b(dob|start_date|end_date|decision_date|review_date|disbursed_date|disbursed_amount)\b/.exec(text);
        if (m) id = m[1];
      }
      if (!id) return;
      var f = $('[name="' + id + '"]', scope);
      if (!f) return;
      /* The wizard wraps a control in .field and styles .field.bad; the drawer
         lays controls out in a plain grid, so there is nothing to mark there.
         Mark whichever box the CSS (or a reader) will actually look at, and put
         the note inside it, so the two never end up in different elements. */
      var field = f.closest(".field");
      var box = field || f.parentNode || f;
      box.classList.add("bad");
      if (!field) f.classList.add("bad");
      var note = box.querySelector(".wireerr");
      if (!note) {
        note = el("p", "wireerr");
        note.style.cssText = "margin:4px 0 0;color:var(--danger,#b3261e);font-size:12.5px";
        box.appendChild(note);
      }
      note.textContent = "The database refused this value: " + text;
      try { f.focus({ preventScroll: false }); } catch (e) {}
    }
    $("#dWa").addEventListener("click", function () {
      var to = W.normalisePhone(r.phone);
      if (!to) { toast("There is no phone number on this file.", "warn"); return; }
      window.open(waLink("Greetings " + (r.beneficiary_name || "") + ", this is the " + CONFIG.teamName + " about case " + r.ref_no +
        ".\nStatus: " + W.status(r.status).label + ".\n" + (r.decision_notes || "")), "_blank", "noopener");
    });
    $("#dCall").addEventListener("click", function () {
      var to = W.normalisePhone(r.phone);
      if (!to) { toast("No phone number on this file.", "warn"); return; }
      location.href = "tel:+" + to;
    });
    $("#dPrint").addEventListener("click", function () { printDoc("Case " + r.ref_no, body.innerHTML); });
    $("#dDel").addEventListener("click", function () {
      if (!canDelete()) {
        toast("Deleting a case file is a leader's decision in this register \u2014 your role can close it, which keeps the record and the reason for the church accounts. Ask a leader to delete it if the file must truly go.",
              "warn", "Needs a leader", 12000);
        return;
      }
      if (!window.confirm("Delete " + r.ref_no + " for " + (r.beneficiary_name || "this beneficiary") + "?\n\nThis removes the file permanently. Prefer setting the status to \"Not approved\" or \"Closed\" so the record and the reason survive for the church accounts.")) return;
      DB.remove(r.id).then(function (res) {
        if (res && res.removed) {
          toast("Case deleted" + (res.synced ? " from the church database." : " from this device only (" + res.reason + ")."), res.synced ? "warn" : "err", r.ref_no, res.synced ? 5000 : 14000);
          closeDrawer(); return loadRegister().then(refreshBadge);
        }
        toast(((res && res.reason) || "the database refused the delete.") + " The file is still here, nothing was lost.", "err", "Not deleted", 14000);
        return loadRegister().then(refreshBadge);
      });
    });
    var rows = currentRows(), idx = rows.map(function (x) { return x.id; }).indexOf(r.id);
    $("#dPrev").disabled = idx <= 0;
    $("#dNext").disabled = idx < 0 || idx >= rows.length - 1;
    $("#dPrev").addEventListener("click", function () { if (idx > 0) openCase(rows[idx - 1].id); });
    $("#dNext").addEventListener("click", function () { if (idx < rows.length - 1) openCase(rows[idx + 1].id); });
  }
  function fld(id, label, val, type, opts) {
    var v = val == null ? "" : String(val);
    var i = type === "area"
      ? '<textarea class="inp" name="' + id + '" rows="3">' + esc(v) + "</textarea>"
      : type === "select"
        ? '<select class="inp" name="' + id + '">' + opts.map(function (o) { return '<option' + (o === v ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>"
        : '<input class="inp" name="' + id + '" type="' + (type === "number" ? "number" : type === "date" ? "date" : "text") + '"' +
          (type === "number" ? ' step="0.01" min="0"' : type === "date" ? "" : "") + ' value="' + esc(v) + '">';
    return '<div><label>' + esc(label) + "</label>" + i + "</div>";
  }

  /* ══════════════ 7b. REGISTRATION FORM (sponsorship) ═════════════════ */
  var regValues = {}, regStep = 0, regOpen = {}, RSECTIONS = FORMS.sponsor;
  var REG_FIELDS = allFields(RSECTIONS);

  function openRegister(kind) {
    regValues = seedDefaults(RSECTIONS, W.blankRecord(kind || "sponsorship"));
    regValues.created_by = CONFIG.teamName;
    regOpen = {}; RSECTIONS.forEach(function (x, i) { regOpen[i] = true; });
    regStep = 0;
    $("#regCard").hidden = false;
    $("#regKindBadge").textContent = kind === "application" ? "Public application, entered by the desk" : "Sponsorship register";
    $("#regTitle").textContent = kind === "application" ? "Key in an application at the desk" : "Register a sponsored beneficiary";
    renderReg();
    $("#regCard").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(function () { var f = $("#regSections .inp"); if (f) f.focus(); }, 420);
  }
  function renderReg() {
    var host = $("#regSections");
    host.innerHTML = "";
    /* Every section is kept in the DOM at once so that a validation error in
       a section you have not opened can still be fixed. Sections can be
       collapsed (and auto-collapse once filled) purely for comfort. */
    var nav = el("div", "regnav");
    nav.id = "regNav";
    RSECTIONS.forEach(function (sec, i) {
      var done = sectionComplete(sec, regValues);
      var b = el("button", "regnav-b" + (i === regStep ? " on" : "") + (done ? " ok" : ""),
        '<span aria-hidden="true">' + (done ? "✅" : esc(sec.ico)) + "</span> " + esc(sec.title));
      b.type = "button";
      b.dataset.jump = i;
      nav.appendChild(b);
    });
    nav.addEventListener("click", function (e) {
      var b = e.target.closest("[data-jump]"); if (!b) return;
      regStep = +b.dataset.jump;
      ensureOpen(regStep); renderReg();
      var t = $("#rg" + regStep); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    host.appendChild(nav);

    RSECTIONS.forEach(function (sec, i) {
      var open = regOpen[i] !== false;   // default: open
      var box = el("div", "regsec" + (open ? "" : " shut"));
      box.id = "rg" + i;
      box.dataset.sec = i;
      var done = sectionComplete(sec, regValues);
      var head = el("button", "regsec-h");
      head.type = "button";
      head.setAttribute("aria-expanded", open ? "true" : "false");
      head.innerHTML = '<span class="ri" aria-hidden="true">' + esc(sec.ico) + "</span>" +
        "<b>" + esc(sec.title) + "</b>" +
        (done ? '<span class="badge tone-ok">complete</span>' : '<span class="badge">open</span>') +
        '<span class="grow"></span><span class="chev">' + (open ? "▴" : "▾") + "</span>";
      head.addEventListener("click", function () { regOpen[i] = !open; renderReg(); });
      box.appendChild(head);
      var body = el("div", "regsec-b");
      var g = el("div", "grid");
      sec.fields.forEach(function (f) { g.appendChild(fieldNode(f, regValues, "rg" + i)); });
      body.appendChild(g);
      if (!open) { body.hidden = true; body.appendChild(el("p", "fs-note", esc(sectionSummary(sec, regValues)))); }
      box.appendChild(body);
      host.appendChild(box);
    });
  }
  function ensureOpen(i) { regOpen[i] = true; }
  function sectionComplete(sec, vals) {
    var req = sec.fields.filter(function (f) { return f.required; });
    if (!req.length) return false;
    return req.every(function (f) {
      var v = vals[f.id];
      if (f.type === "checkbox") return v === true || v === "true" || v === "on";
      return v !== undefined && v !== null && String(v).trim() !== "";
    });
  }

  function sectionSummary(sec, vals) {
    var f = sec.fields.filter(function (x) { return !x.adminOnly; })[0];
    var v = f ? vals[f.id] : "";
    if (!v || v === true) return "Not started · " + sec.fields.length + " fields";
    var filled = sec.fields.filter(function (x) { return vals[x.id] || (x.store && (vals[x.store] || []).length); }).length;
    return filled + " of " + sec.fields.length + " done · " + String(v).slice(0, 34);
  }
  $("#regSections").addEventListener("input", debounce(function () { readForm($("#regSections"), regValues, RSECTIONS); }, 180));
  $("#regSections").addEventListener("change", function (e) {
    if (e.target.matches("[data-check]")) { var l = e.target.closest(".chip"); if (l) l.classList.toggle("on", e.target.checked); }
    if (e.target.matches("[data-field]") && e.target.type === "checkbox") { var c = e.target.closest(".consent"); if (c) c.classList.toggle("on", e.target.checked); }
    readForm($("#regSections"), regValues, RSECTIONS);
  });
  $("#btnNew").addEventListener("click", function () { openRegister("sponsorship"); });
  $("#regClose, #regCancel").addEventListener("click", function () { $("#regCard").hidden = true; });
  $("#regForm").addEventListener("submit", function (e) {
    e.preventDefault();
    readForm($("#regSections"), regValues, RSECTIONS);
    var r = W.validate(regValues, REG_FIELDS);
    if (!r.ok) {
      var first = -1;
      for (var i = 0; i < RSECTIONS.length; i++) {
        var hit = RSECTIONS[i].fields.some(function (f) { return r.errors[f.id]; });
        if (hit) { if (first < 0) first = i; regOpen[i] = true; }   // open every section holding an error
      }
      renderReg();
      requestAnimationFrame(function () {
        paintErrors($("#regSections"), r.errors);
        var t = $("#rg" + first); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
        var bad = $(".field.bad .inp", $("#regSections")); if (bad) bad.focus();
      });
      toast(r.count + " required field" + (r.count === 1 ? "" : "s") + " still need attention — the sections holding them were opened for you.", "err", "Cannot save");
      return;
    }
    var rec = Object.assign(W.blankRecord("sponsorship"), regValues);
    rec.created_by = CONFIG.teamName; rec.updated_at = new Date().toISOString();
    if (!rec.ref_no) rec.ref_no = "";
    busy($("#regSave"), true, "Filing…");
    DB.create(rec).then(function (saved) {
      busy($("#regSave"), false);
      $("#regCard").hidden = true;
      toast("Filed as " + saved.ref_no + (saved._synced ? " in the church database." : " on this device — it will sync when connected."),
        "ok", "Beneficiary registered");
      loadRegister().then(function () { paintHomeStats(); refreshBadge(); openCase(saved.id); });
    }).catch(function (e) { busy($("#regSave"), false); toast("Save failed: " + ((e && e.message) || e), "err"); });
  });

  /* ══════════════ 8. EXPORT + PRINT ═══════════════════════════════════ */
  $("#btnCsv").addEventListener("click", function () { exportCsv(false); });
  $("#btnCsvFull").addEventListener("click", function () { exportCsv(true); });
  function exportCsv(full) {
    var rows = currentRows();
    if (!rows.length) { toast("There is nothing in view to export.", "warn"); return; }
    var cols = full ? J.FULL_COLUMNS : J.ADMIN_COLUMNS;
    var csv = W.toCSV(rows, cols);
    dl(new Blob([csv], { type: "text/csv;charset=utf-8" }), "JCRGM-welfare-" + (full ? "full" : "board") + "-" + W.todayISO() + ".csv");
    toast("Exported " + rows.length + " case(s). Open the CSV in Excel or Google Sheets — the header row is ready for filters.", "ok");
  }
  $("#btnPrint").addEventListener("click", function () {
    var rows = currentRows();
    printDoc("JCRGM Welfare Register — " + rows.length + " case(s) — " + nice(W.todayISO()),
      '<table class="reg" style="min-width:0;width:100%"><thead><tr><th>Ref</th><th>Beneficiary</th><th>Need</th><th>Status</th><th>Amount</th><th>Sponsor</th><th>Where</th><th>Filed</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return "<tr><td class='ref'>" + esc(r.ref_no) + "</td><td><b>" + esc(r.beneficiary_name || "") + "</b><span class='sub'>" +
          esc([W.ageFromDob(r.dob) != null ? W.ageFromDob(r.dob) + "y" : "", r.gender].filter(Boolean).join(" · ")) + "</span></td><td>" +
          esc(W.category(r.category).label) + "</td><td>" + esc(W.status(r.status).label) + "</td><td class='num'>" +
          esc(W.formatMoney(r.amount_requested, r.currency)) + "</td><td>" + esc(r.sponsor_name || r.referenced_by || "—") + "</td><td>" +
          esc([r.compound, r.city].filter(Boolean).join(", ")) + "</td><td>" + esc(nice(r.created_at)) + "</td></tr>";
      }).join("") + "</tbody></table>" +
      '<p style="margin-top:16px;font-size:10pt;color:#444">Confidential — prepared by the ' + esc(CONFIG.teamName) + " for church governance and donor reporting only. Personal data handled per the Data Protection Act No. 3 of 2021.</p>");
  });
  function printDoc(title, inner) {
    var f = el("iframe");
    f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0";
    document.body.appendChild(f);
    var d = f.contentDocument;
    d.open();
    d.write("<!doctype html><html><head><meta charset='utf-8'><title>" + esc(CONFIG.shortName + " — " + title) + "</title>" +
      "<style>body{font-family:'Segoe UI',Arial,sans-serif;color:#16213a;padding:16px;font-size:11pt}" +
      "h1{font-size:15pt;margin:0 0 3px}.sub{color:#64748b;font-size:9.5pt;margin:0 0 14px}" +
      "table{border-collapse:collapse;width:100%;font-size:9.5pt}th,td{border:1px solid #d6deea;padding:5px 6px;text-align:left;vertical-align:top}" +
      "th{background:#f1f5fb;text-transform:uppercase;font-size:7.5pt;letter-spacing:.5px}" +
      "tr:nth-child(even) td{background:#fafcff}.sub{display:block}.ref{font-family:monospace;white-space:nowrap}" +
      ".num{text-align:right;white-space:nowrap;font-weight:600}.dl{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px}" +
      ".dsec{margin:0 0 10px;border:0;padding:0}.dsec h4{font-size:8.5pt;text-transform:uppercase;letter-spacing:1px;color:#8a6d1a;margin:10px 0 4px}" +
      ".prose{border-left:2px solid #1f3c88;padding-left:8px}.note,.row,.steamp{display:none!important}" +
      "@page{margin:13mm}</style></head><body><h1>" + esc(title) + "</h1>" +
      '<p class="sub">' + esc(CONFIG.fullName) + " · " + esc(CONFIG.unitName) + " · printed " +
      new Date().toLocaleString("en-GB") + "</p>" + inner + "</body></html>");
    d.close();
    setTimeout(function () {
      try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { toast("Printing is not available here — use the browser menu instead.", "warn"); }
      setTimeout(function () { document.body.removeChild(f); }, 1500);
    }, 340);
  }

  /* ══════════════ SYNC ════════════════════════════════════════════════ */
  $("#btnSync").addEventListener("click", function () {
    busy(this, true, "Syncing…");
    DB.syncQueue().then(function (r) {
      busy($("#btnSync"), false);
      paintMode(); refreshBadge();
      if (r.sent) toast(r.sent + " record(s) uploaded to the church database." + (r.failed ? " " + r.failed + " still queued." : ""), r.failed ? "warn" : "ok", "Sync");
      else toast(r.reason || "Nothing to send.", r.failed ? "warn" : "info", "Sync");
      loadRegister();
    }).catch(function (e) { busy($("#btnSync"), false); toast("Sync failed: " + ((e && e.message) || e), "err"); });
  });

  /* ══════════════ 9. BOOT ═════════════════════════════════════════════ */
  function boot() {
    brand();
    loadDraft();
    paintStep(false);
    paintMode();
    // deep links from index.html: #apply, #status, #admin (or #welfare for home)
    var wanted = (location.hash || "").slice(1);
    show(wanted === "welfare" || !wanted ? "home" : wanted, false);
    paintHomeStats();
    setInterval(function () { if (unlocked) paintHomeStats(); }, 45000);
    if (!DB.live()) {
      setTimeout(function () {
        var shared = (typeof window !== "undefined" && window.JCRGM_SUPABASE && window.JCRGM_SUPABASE.url);
        toast(shared
          ? "The church project is set but its key was not accepted, so nothing can upload yet. Check supabase-config.js in the repo root — records stay safe on this phone until then."
          : "No Supabase project was found beside these pages, so records stay on this phone and upload when supabase-config.js and vendor/supabase.js are present with the app. Run supabase-schema.sql in that project once.",
          "warn", "Working offline", 9000);
      }, 1600);
    }
  }
  var lastIdentity = "";
  window.addEventListener("church-identity", function () {
    if (J.supabase.bindPlatformClient) J.supabase.bindPlatformClient();
    var c = window.Church;
    var key = c ? [c.user && c.user.id || "", c.member && c.member.approved || "", c.member && c.member.role || ""].join("/") : "";
    paintMode();
    if (c && c.configured) { try { c.wireAuth(); } catch (e) {} }
    if (key !== lastIdentity) { lastIdentity = key; if (unlocked) loadRegister(); refreshAccess(); }
  });
  // the sign-in buttons are injected after page load, so wire them by delegation
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-church-signin]") : null;
    if (b) { e.preventDefault(); openAuth(); }
  });
  window.addEventListener("online", function () { paintMode(); toast("Back online — the register will refresh.", "ok"); if (unlocked) loadRegister(); });
  window.addEventListener("offline", function () { paintMode(); toast("Offline. New records will be kept on this phone and uploaded later.", "warn"); if (unlocked) loadRegister(); });

  /* Start the shared church layer. announcements.js does the same from its own
     file - church-platform.js only defines the API, so a page that forgets this
     line sits at "Checking access" forever. */
  (function startPlatform() {
    var c = window.Church;
    if (c && !c.ready && c.start) { try { c.start(); } catch (e) {} }
    else if (c && c.refreshIdentity) { try { c.refreshIdentity(); } catch (e) {} }
  })();

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  /* ══════════════ 10. TEST HOOKS (harmless in production) ═════════════ */
  window.JCRGM_UI = {
    esc: esc, nice: nice, ago: ago, timelineFor: timelineFor,
    fieldNode: fieldNode, renderSections: renderSections, readForm: readForm,
    paintErrors: paintErrors, currentRows: currentRows, filter: filter,
    records: function () { return records; }, show: show, openCase: openCase,
    openRegister: openRegister, sessionValid: sessionValid, toast: toast,
    refreshAccess: function () { return refreshAccess(); }, permission: permission,
    closeDesk: function (m) { return closeDesk(m); },
    paintMode: paintMode, deskReady: deskReady
  };
})();
