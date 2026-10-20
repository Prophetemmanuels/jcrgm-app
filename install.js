/* ==========================================================================
   JCRGM UNIVERSAL AUTO-INSTALLER  v1.0
   --------------------------------------------------------------------------
   One file that makes the site installable on ANY device:

     • Android (Chrome, Edge, Samsung, Opera, Brave)  -> one-tap install
     • iPhone / iPad / iPod (Safari + Chrome/Firefox) -> guided 2-tap install
     • Windows / macOS / Linux / ChromeOS             -> one-click desktop app
     • Already installed                              -> silently does nothing
     • In-app browsers (WhatsApp, Facebook, IG, …)     -> escapes to real browser

   It also registers the service worker, shows "new version available",
   and exposes a small API:

       JCRGMInstall.open()      // open the install sheet
       JCRGMInstall.prompt()    // trigger the native install prompt (if ready)
       JCRGMInstall.canPrompt() // true when one-tap install is available
       JCRGMInstall.isInstalled()
       JCRGMInstall.share()     // share the link to another phone
       JCRGMInstall.copyLink()

   Configure via data-* attributes on the <script> tag (all optional):
       <script src="install.js"
               data-app-name="JCRGM"
               data-auto="1"          auto-offer install (1/0)
               data-delay="12000"     ms before the first offer
               data-snooze="14">      days before asking again
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- config */
  var SCRIPT = document.currentScript || (function () {
    var all = document.getElementsByTagName('script');
    for (var i = all.length - 1; i >= 0; i--) {
      if (/install\.js(\?|$)/.test(all[i].src || '')) return all[i];
    }
    return null;
  })();

  var BASE = './';
  try { if (SCRIPT && SCRIPT.src) BASE = SCRIPT.src.replace(/[^\/]*$/, ''); } catch (e) {}

  function attr(name, dflt) {
    var v = SCRIPT && SCRIPT.getAttribute('data-' + name);
    return (v === null || v === '') ? dflt : v;
  }

  var CFG = {
    appName:     attr('app-name', 'JCRGM'),
    fullName:    attr('full-name', 'Jesus Christ Redeems Global Ministries'),
    tagline:     attr('tagline', 'Church services, giving, transport desk and ministry tools — one tap, every time.'),
    installPage: attr('install-page', BASE + 'install.html'),
    icon:        BASE + 'assets/icons/icon-192.png',
    icon512:     BASE + 'assets/icons/icon-512.png',
    manifest:    BASE + 'manifest.webmanifest',
    sw:          BASE + 'service-worker.js',
    auto:        attr('auto', '1') === '1',
    delay:       parseInt(attr('delay', '12000'), 10) || 12000,
    snoozeDays:  parseInt(attr('snooze', '14'), 10) || 14,
    waitFor:     attr('wait-for', '#welcomeGate'),
    debug:       attr('debug', '0') === '1'
  };

  var KEY = {
    installed: 'jcrgm_install_done',
    snooze:    'jcrgm_install_snooze',
    never:     'jcrgm_install_never',
    visits:    'jcrgm_install_visits',
    seenSheet: 'jcrgm_install_seen'
  };

  var NAVY = '#101d44', PRIMARY = '#1f3c88', GOLD = '#ffd700', GOLD_DEEP = '#b8912c';

  /* --------------------------------------------------------------- storage */
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* ----------------------------------------------------------- device info */
  function ua() { return navigator.userAgent || ''; }

  var P = (function detect() {
    var u = ua();
    var iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    var ios = /iPad|iPhone|iPod/.test(u) || iPadOS;
    var android = /Android/.test(u);
    var win = /Windows NT|Windows Phone/.test(u);
    var mac = /Macintosh|Mac OS X/.test(u) && !iPadOS;
    var cros = /CrOS/.test(u);
    var linux = /Linux/.test(u) && !android && !cros;

    var inApp = null;
    if (/WhatsApp/.test(u)) inApp = 'WhatsApp';
    else if (/FBAN|FBAV|FB_IAB|Instagram/.test(u)) inApp = 'Facebook / Instagram';
    else if (/Messenger/.test(u)) inApp = 'Messenger';
    else if (/MicroMessenger/.test(u)) inApp = 'WeChat';
    else if (/TikTok|musical_ly|BytedanceWebview|Bytedance/.test(u)) inApp = 'TikTok';
    else if (/Snapchat/.test(u)) inApp = 'Snapchat';
    else if (/\bLine\//.test(u)) inApp = 'LINE';
    else if (/Twitter/.test(u)) inApp = 'X (Twitter)';
    else if (/GSA\//.test(u)) inApp = 'the Google app';
    else if (android && /; wv\)/.test(u)) inApp = 'an in-app browser';

    var browser = 'other';
    if (/Edg(e|A|iOS)?\//.test(u)) browser = 'edge';
    else if (/OPR\/|Opera/.test(u)) browser = 'opera';
    else if (/SamsungBrowser/.test(u)) browser = 'samsung';
    else if (/FxiOS|Firefox/.test(u)) browser = 'firefox';
    else if (/CriOS/.test(u)) browser = 'chrome';
    else if (/Chrome\//.test(u)) browser = 'chrome';
    else if (/Safari\//.test(u) && !/Chrome|Chromium|Android/.test(u)) browser = 'safari';

    var os = ios ? 'ios' : android ? 'android' : win ? 'windows' : mac ? 'mac' : cros ? 'cros' : linux ? 'linux' : 'other';

    return {
      os: os, ios: ios, android: android, desktop: !ios && !android,
      browser: browser, inApp: inApp,
      safari: browser === 'safari' && ios,
      chromeIOS: ios && browser === 'chrome',
      firefoxIOS: ios && browser === 'firefox',
      edgeIOS: ios && browser === 'edge'
    };
  })();

  function isStandalone() {
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
      if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
      if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) return true;
      if (window.matchMedia && window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
    } catch (e) {}
    if (navigator.standalone === true) return true;           // legacy iOS
    if (window.navigator.standalone === true) return true;
    return false;
  }

  /* --------------------------------------------------------------- runtime */
  var deferredPrompt = null;
  var installed = isStandalone() || read(KEY.installed) === '1';
  var host = null, shadow = null, sheetOpen = false, bannerVisible = false;
  var lastFocus = null, mounted = false, updateReady = false, swReg = null;

  /* ============================================================== markup */
  var STYLE = [
    ':host,*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}',
    '.wrap{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Arial,sans-serif;',
    '  color:#0f172a;line-height:1.5;font-size:15px}',

    /* ---- floating launcher ---- */
    '.launcher{position:fixed;left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));',
    '  z-index:2147483001;display:none;align-items:center;gap:8px;padding:10px 15px 10px 11px;border:0;',
    '  border-radius:999px;cursor:pointer;font:600 14px/1 inherit;color:' + NAVY + ';',
    '  background:linear-gradient(135deg,#ffe680,' + GOLD + ' 45%,' + GOLD_DEEP + ');',
    '  box-shadow:0 10px 26px rgba(16,29,68,.32),0 0 0 1px rgba(16,29,68,.10);',
    '  transition:transform .18s ease,box-shadow .18s ease;animation:jcin .4s ease both}',
    '.launcher:active{transform:scale(.96)}',
    '.launcher.show{display:inline-flex}',
    '.launcher img{width:22px;height:22px;border-radius:6px;display:block}',
    '.launcher .dot{width:7px;height:7px;border-radius:50%;background:#16a34a;',
    '  box-shadow:0 0 0 3px rgba(22,163,74,.20);margin-left:-3px}',
    '.launcher.hide{display:none!important}',

    /* ---- bottom offer banner ---- */
    '.banner{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));',
    '  z-index:2147483000;display:none;max-width:440px;margin:0 auto;border-radius:20px;',
    '  background:linear-gradient(150deg,#16295e,' + NAVY + ' 55%,#0b1530);',
    '  color:#fff;padding:14px 14px 14px 14px;box-shadow:0 20px 50px rgba(6,12,30,.48);',
    '  border:1px solid rgba(255,215,0,.28);animation:jcup .32s cubic-bezier(.2,.9,.3,1.2) both}',
    '.banner.show{display:block}',
    '.banner .row{display:flex;gap:11px;align-items:flex-start}',
    '.banner img.ico{width:44px;height:44px;border-radius:12px;flex:0 0 auto;',
    '  box-shadow:0 4px 12px rgba(0,0,0,.35)}',
    '.banner .txt{flex:1 1 auto;min-width:0}',
    '.banner .t1{font-weight:700;font-size:14.5px;letter-spacing:.01em}',
    '.banner .t2{font-size:12.5px;color:rgba(255,255,255,.74);margin-top:2px}',
    '.banner .x{background:rgba(255,255,255,.10);border:0;color:rgba(255,255,255,.8);',
    '  width:26px;height:26px;border-radius:50%;font-size:15px;line-height:1;cursor:pointer;flex:0 0 auto}',
    '.banner .acts{display:flex;gap:8px;margin-top:11px}',
    '.banner .b1{flex:1 1 auto;border:0;border-radius:12px;padding:10px 14px;cursor:pointer;',
    '  font:700 13.5px/1 inherit;color:' + NAVY + ';',
    '  background:linear-gradient(135deg,#ffe680,' + GOLD + ' 50%,' + GOLD_DEEP + ')}',
    '.banner .b2{flex:0 0 auto;border:1px solid rgba(255,255,255,.22);border-radius:12px;',
    '  padding:10px 13px;cursor:pointer;background:transparent;color:rgba(255,255,255,.86);',
    '  font:600 13px/1 inherit}',

    /* ---- sheet ---- */
    '.scrim{position:fixed;inset:0;z-index:2147483002;background:rgba(6,12,30,.62);',
    '  -webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:none;opacity:0;',
    '  transition:opacity .22s ease}',
    '.scrim.show{display:block;opacity:1}',
    '.sheet{position:fixed;z-index:2147483003;left:0;right:0;bottom:0;margin:0 auto;',
    '  width:100%;max-width:470px;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;',
    '  background:#fff;border-radius:24px 24px 0 0;padding:8px 18px calc(20px + env(safe-area-inset-bottom,0px));',
    '  box-shadow:0 -18px 60px rgba(6,12,30,.45);transform:translateY(102%);',
    '  transition:transform .34s cubic-bezier(.22,.9,.28,1);display:none}',
    '.sheet.show{display:block;transform:translateY(0)}',
    '@media(min-width:620px){',
    '  .sheet{bottom:auto;top:50%;transform:translateY(-46%) scale(.97);border-radius:24px;',
    '    max-height:86vh;padding-bottom:20px}',
    '  .sheet.show{transform:translateY(-50%) scale(1)}',
    '  .sheet .grab{display:none}',
    '}',
    '.grab{width:42px;height:4px;border-radius:99px;background:#dbe3ef;margin:6px auto 12px}',

    '.hero{display:flex;gap:14px;align-items:center;padding:2px 0 4px}',
    '.hero img{width:60px;height:60px;border-radius:16px;flex:0 0 auto;',
    '  box-shadow:0 8px 20px rgba(16,29,68,.22)}',
    '.hero .h1{font-weight:800;font-size:17px;letter-spacing:-.01em;color:' + NAVY + ';line-height:1.25}',
    '.hero .h2{font-size:12px;color:#64748b;margin-top:2px;font-weight:600;letter-spacing:.02em;text-transform:uppercase}',
    '.tagline{font-size:13.5px;color:#475569;margin:10px 0 0}',

    '.status{display:flex;gap:9px;align-items:flex-start;margin:14px 0 0;padding:11px 12px;',
    '  border-radius:14px;font-size:13px;font-weight:600;line-height:1.45}',
    '.status.ok{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}',
    '.status.info{background:#eef4ff;color:#1e3a8a;border:1px solid #bfd3ff}',
    '.status.warn{background:#fff7ed;color:#9a3412;border:1px solid #fed7aa}',
    '.status .si{font-size:15px;line-height:1.2;flex:0 0 auto}',

    '.cta{display:block;width:100%;margin:14px 0 0;border:0;border-radius:15px;padding:15px 16px;',
    '  cursor:pointer;font:800 15.5px/1.1 inherit;color:' + NAVY + ';',
    '  background:linear-gradient(135deg,#ffe680,' + GOLD + ' 48%,' + GOLD_DEEP + ');',
    '  box-shadow:0 10px 24px rgba(184,145,44,.35);transition:transform .15s ease,filter .2s}',
    '.cta:active{transform:translateY(1px) scale(.995)}',
    '.cta[disabled]{filter:grayscale(.4);opacity:.65;cursor:default;box-shadow:none}',
    '.cta.alt{background:#f1f5fb;color:' + PRIMARY + ';box-shadow:none;border:1px solid #dbe3ef;',
    '  font-weight:700;font-size:14px;padding:13px 16px}',

    '.steps{margin:14px 0 0;padding:0;list-style:none;counter-reset:st}',
    '.steps li{position:relative;padding:0 0 0 40px;margin:0 0 13px;font-size:13.5px;color:#334155;line-height:1.5}',
    '.steps li:last-child{margin-bottom:0}',
    '.steps li:before{counter-increment:st;content:counter(st);position:absolute;left:0;top:-1px;',
    '  width:26px;height:26px;border-radius:50%;background:' + PRIMARY + ';color:#fff;',
    '  font:700 13px/26px inherit;text-align:center}',
    '.steps b{color:' + NAVY + '}',
    '.steps .glyph{display:inline-flex;vertical-align:-3px;margin:0 1px}',
    '.steps .glyph svg{width:15px;height:15px;fill:none;stroke:' + PRIMARY + ';stroke-width:1.9;',
    '  stroke-linecap:round;stroke-linejoin:round}',

    '.divider{height:1px;background:#eef2f8;margin:16px 0 0}',
    '.fine{font-size:11.5px;color:#94a3b8;margin:12px 0 0;text-align:center;line-height:1.5}',
    '.row2{display:flex;gap:8px;margin-top:12px}',
    '.row2 button{flex:1 1 0;border:1px solid #dbe3ef;background:#fff;border-radius:13px;padding:11px 8px;',
    '  cursor:pointer;font:600 12.5px/1.2 inherit;color:' + PRIMARY + '}',
    '.row2 button:active{background:#f4f7fd}',
    '.quiet{display:block;width:100%;margin:10px 0 0;background:none;border:0;padding:8px;',
    '  font:600 12.5px/1 inherit;color:#94a3b8;cursor:pointer;text-decoration:underline}',

    '.done{text-align:center;padding:10px 0 0}',
    '.done .tick{width:64px;height:64px;border-radius:50%;margin:6px auto 10px;',
    '  background:linear-gradient(135deg,#34d399,#059669);color:#fff;font-size:32px;line-height:64px;',
    '  box-shadow:0 12px 28px rgba(5,150,105,.35);animation:jcpop .45s cubic-bezier(.2,.9,.3,1.4) both}',
    '.done h3{margin:0;font-size:18px;color:' + NAVY + '}',
    '.done p{margin:6px 0 0;font-size:13px;color:#64748b}',

    'details.more{margin-top:14px;border:1px solid #eef2f8;border-radius:13px;padding:0 12px;background:#fbfcfe}',
    'details.more summary{cursor:pointer;padding:12px 0;font:700 12.5px/1 inherit;color:' + PRIMARY + ';list-style:none}',
    'details.more summary::-webkit-details-marker{display:none}',
    'details.more summary:before{content:"＋ ";font-weight:800}',
    'details.more[open] summary:before{content:"− "}',
    'details.more .body{padding:0 0 12px;font-size:12.5px;color:#475569}',
    'details.more .body div{margin:0 0 7px}',

    /* ---- update bar ---- */
    '.upd{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));',
    '  z-index:2147483000;max-width:420px;margin:0 auto;display:none;align-items:center;gap:10px;',
    '  background:#16295e;color:#fff;border:1px solid rgba(255,215,0,.3);border-radius:16px;',
    '  padding:11px 12px;font-size:13px;font-weight:600;box-shadow:0 14px 34px rgba(6,12,30,.4)}',
    '.upd.show{display:flex}',
    '.upd button{margin-left:auto;border:0;border-radius:10px;padding:9px 13px;cursor:pointer;',
    '  font:800 12.5px/1 inherit;color:' + NAVY + ';',
    '  background:linear-gradient(135deg,#ffe680,' + GOLD + ' 50%,' + GOLD_DEEP + ')}',

    '@keyframes jcup{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes jcin{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}',
    '@keyframes jcpop{0%{opacity:0;transform:scale(.4)}100%{opacity:1;transform:scale(1)}}',
    '@media(prefers-reduced-motion:reduce){.banner,.launcher,.sheet,.done .tick{animation:none!important;transition:none!important}}'
  ].join('\n');

  var GLYPHS = {
    share: '<span class="glyph"><svg viewBox="0 0 24 24"><path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg></span>',
    plus:  '<span class="glyph"><svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M12 9v6M9 12h6"/></svg></span>',
    dots:  '<span class="glyph"><svg viewBox="0 0 24 24"><circle cx="12" cy="5.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="18.5" r="1.4"/></svg></span>',
    menu:  '<span class="glyph"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></span>',
    bar:   '<span class="glyph"><svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M8 12h8M12 8v8"/></svg></span>'
  };

  /* --------------------------------------------------------- steps per OS */
  function stepsFor() {
    if (P.inApp) {
      return {
        tone: 'warn',
        icon: '⚠️',
        status: 'You opened this inside ' + P.inApp + '. Install needs a real browser — tap the button below to jump out, then try again.',
        cta: 'Open in my browser',
        action: 'escape',
        steps: null
      };
    }

    if (P.ios) {
      var shareSheet = (P.safari ? 'the <b>Share</b> button ' + GLYPHS.share + ' in the toolbar'
        : 'your browser’s <b>Share</b> button');
      var altNote = P.safari ? '' :
        ' If you don’t see “Add to Home Screen”, open this page in <b>Safari</b> first — that’s where iPhone allows it.';
      return {
        tone: 'info',
        icon: '📲',
        status: P.safari
          ? 'iPhone & iPad install in two quick taps — Apple keeps it inside the Share menu.'
          : 'You’re using ' + (P.chromeIOS ? 'Chrome' : P.firefoxIOS ? 'Firefox' : 'a browser other than Safari') + ' on iOS. ' + (P.chromeIOS || P.firefoxIOS ? 'It can still add the app — steps below.' : ''),
        cta: null,
        steps: [
          'Tap ' + shareSheet + '.',
          'Scroll the menu and tap <b>Add to Home Screen</b> ' + GLYPHS.plus + '.',
          'Tap <b>Add</b> (top-right). The ' + CFG.appName + ' icon appears on your Home Screen — open it any time, no internet needed for saved pages.' + altNote
        ]
      };
    }

    if (P.android) {
      var menu = P.samsung ? 'Tap the ☰ menu at the bottom' :
                 P.firefox ? 'Tap the ⋮ menu (top-right)' :
                 P.opera ? 'Tap the <b>O</b> menu' :
                 'Tap the ⋮ menu (top-right)';
      return {
        tone: 'info',
        icon: '🤖',
        status: 'Android installs in one tap when Chrome offers it — if not, the menu does the same job.',
        cta: null,
        steps: [
          menu + '.',
          'Tap <b>Install app</b> — on older phones it says <b>Add to Home screen</b> ' + GLYPHS.plus + '.',
          'Confirm <b>Install</b>. The ' + CFG.appName + ' icon appears on your Home Screen and in your app drawer, and opens full-screen without the browser bars.'
        ]
      };
    }

    /* desktop */
    var desk = 'Click the <b>install</b> icon in the address bar (a ⊕ or screen icon), or open the ⋮ menu → <b>Install ' + CFG.appName + '</b>.';
    if (P.browser === 'edge') desk = 'Open the ⋯ menu → <b>Apps</b> → <b>Install this site as an app</b>.';
    if (P.browser === 'safari' && P.os === 'mac') desk = 'In Safari 17+ choose <b>File → Add to Dock</b>.';
    if (P.browser === 'firefox') {
      return {
        tone: 'warn', icon: '🦊',
        status: 'Firefox doesn’t install web apps on desktop — but Chrome, Edge or Safari on this same computer will do it in one click.',
        cta: null,
        steps: ['Open this page in <b>Chrome</b>, <b>Edge</b> or <b>Safari</b>.', 'Then click the install icon in the address bar.', 'The ' + CFG.appName + ' app opens in its own window and appears in your Start menu / Dock / Applications.']
      };
    }
    return {
      tone: 'info', icon: '💻',
      status: 'Install ' + CFG.appName + ' as a desktop app — it gets its own window, its own icon and starts instantly.',
      cta: null,
      steps: [desk, 'Click <b>Install</b>.', 'The app opens in its own window. Pin it to your taskbar, Dock or Start menu like any other program.']
    };
  }

  /* ============================================================ rendering */
  function html() {
    var s = stepsFor();
    var parts = [];

    parts.push('<div class="wrap">');

    /* launcher */
    parts.push('<button class="launcher" data-act="open" aria-label="Install ' + CFG.appName + '">');
    parts.push('<img src="' + CFG.icon + '" alt=""><span>Install app</span><span class="dot"></span></button>');

    /* banner */
    parts.push('<div class="banner" role="region" aria-label="Install ' + CFG.appName + '">');
    parts.push('<div class="row"><img class="ico" src="' + CFG.icon + '" alt="">');
    parts.push('<div class="txt"><div class="t1">Install ' + CFG.appName + ' on this device</div>');
    parts.push('<div class="t2">' + (P.ios ? 'Two taps — icon goes straight to your Home Screen.' : P.inApp ? 'Needs a real browser — we’ll show you how.' : 'Opens full-screen, right from your home screen.') + '</div></div>');
    parts.push('<button class="x" data-act="snooze" aria-label="Not now">✕</button></div>');
    parts.push('<div class="acts"><button class="b1" data-act="open">Install now</button>');
    parts.push('<button class="b2" data-act="snooze">Later</button></div></div>');

    /* update bar */
    parts.push('<div class="upd" role="status">🔔 A new version of ' + CFG.appName + ' is ready<button data-act="update">Update</button></div>');

    /* sheet */
    parts.push('<div class="scrim" data-act="close"></div>');
    parts.push('<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="jci-title">');
    parts.push('<div class="grab"></div>');

    if (installed) {
      parts.push('<div class="done"><div class="tick">✓</div><h3>' + CFG.appName + ' is installed</h3>');
      parts.push('<p>Open it from your home screen or app list any time.</p>');
      parts.push('<button class="cta" data-act="launch">Open the app</button>');
      parts.push('<button class="quiet" data-act="close">Close</button></div>');
    } else {
      parts.push('<div class="hero"><img src="' + CFG.icon + '" alt="">');
      parts.push('<div><div class="h1" id="jci-title">' + CFG.fullName + '</div>');
      parts.push('<div class="h2">Install the app · free</div></div></div>');
      parts.push('<p class="tagline">' + CFG.tagline + '</p>');

      parts.push('<div class="status ' + s.tone + '"><span class="si">' + s.icon + '</span><span>' + s.status + '</span></div>');

      if (deferredPrompt && !P.ios && !P.inApp) {
        parts.push('<button class="cta" data-act="install">Install ' + CFG.appName + ' now</button>');
      } else if (s.cta) {
        parts.push('<button class="cta" data-act="' + s.action + '">' + s.cta + '</button>');
      }

      if (s.steps && s.steps.length) {
        parts.push('<ol class="steps">');
        for (var i = 0; i < s.steps.length; i++) parts.push('<li>' + s.steps[i] + '</li>');
        parts.push('</ol>');
      }

      parts.push('<div class="row2">');
      parts.push('<button data-act="share">📤 Invite someone</button>');
      parts.push('<button data-act="copy">🔗 Copy link</button>');
      parts.push('</div>');

      parts.push('<details class="more"><summary>Does this work on my other devices?</summary><div class="body">');
      parts.push('<div>🤖 <b>Android</b> — Chrome / Edge / Samsung Internet: menu → Install app.</div>');
      parts.push('<div>🍎 <b>iPhone & iPad</b> — Safari: Share ' + GLYPHS.share + ' → Add to Home Screen.</div>');
      parts.push('<div>💻 <b>Windows / Mac / Linux</b> — Chrome or Edge: install icon in the address bar.</div>');
      parts.push('<div>📵 <b>Offline & data</b> — once installed it opens instantly and keeps working when the network drops.</div>');
      parts.push('<div>🔒 <b>No app store, no fees, no permissions</b> — it is this same website, packaged as an app.</div>');
      parts.push('</div></details>');

      parts.push('<p class="fine">Installing adds a shortcut on this device only. Your details and forms stay in this browser.</p>');
      parts.push('<button class="quiet" data-act="never">Don’t show this again</button>');
    }

    parts.push('</div></div>');
    return parts.join('');
  }

  /* ---------------------------------------------------------------- mount */
  function mount() {
    if (mounted || !document.body) return;
    host = document.createElement('div');
    host.id = 'jcrgm-install-host';
    host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;';
    document.body.appendChild(host);

    shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : null;
    if (!shadow) {                                  // very old browsers: no shadow DOM
      host.style.cssText = '';
      shadow = host;
      var st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);
    } else {
      var styleEl = document.createElement('style'); styleEl.textContent = STYLE; shadow.appendChild(styleEl);
    }
    shadow.appendChild(document.createElement('div')).className = 'mount';

    render();
    mounted = true;
  }

  function render() {
    if (!shadow) return;
    var box = shadow.querySelector('.mount');
    if (!box) return;
    box.innerHTML = html();
    var l = box.querySelector('.launcher');
    if (l) l.style.pointerEvents = 'auto';
    var bn = box.querySelector('.banner');
    if (bn) bn.style.pointerEvents = 'auto';
    var sh = box.querySelector('.sheet');
    if (sh) sh.style.pointerEvents = 'auto';
    var sc = box.querySelector('.scrim');
    if (sc) sc.style.pointerEvents = 'auto';
    if (sheetOpen && sh) { sc.classList.add('show'); sh.classList.add('show'); }
    syncExternalButtons();
  }

  function q(sel) { return shadow ? shadow.querySelector(sel) : null; }

  function showLauncher(on) {
    var l = q('.launcher');
    if (!l) return;
    if (installed) { l.classList.remove('show'); return; }
    if (on && gateBlocking()) { whenGateClear(function () { showLauncher(true); }); return; }
    l.classList.toggle('show', !!on);
  }

  function showBanner(on) {
    var b = q('.banner');
    if (!b) return;
    if (installed) { b.classList.remove('show'); return; }
    if (on && gateBlocking()) {
      b.classList.remove('show'); bannerVisible = false;
      whenGateClear(function () { showBanner(true); });
      return;
    }
    b.classList.toggle('show', !!on);
    bannerVisible = !!on;
    if (on) showLauncher(false);
  }

  /* ---------------------------------------------------------- open / close */
  function openSheet() {
    mount();
    if (!shadow) return;
    if (!q('.sheet')) render();
    sheetOpen = true;
    lastFocus = document.activeElement;
    render();
    var sc = q('.scrim'), sh = q('.sheet');
    if (sc) sc.classList.add('show');
    if (sh) { sh.classList.add('show'); try { sh.scrollTop = 0; } catch (e) {} }
    showBanner(false);
    try { document.documentElement.style.overflow = 'hidden'; } catch (e) {}
    try { store(KEY.seenSheet, '1'); } catch (e) {}
    var btn = q('.cta'); if (btn && btn.focus) { try { btn.focus({ preventScroll: true }); } catch (e) {} }
  }

  function closeSheet() {
    sheetOpen = false;
    var sc = q('.scrim'), sh = q('.sheet');
    if (sc) sc.classList.remove('show');
    if (sh) sh.classList.remove('show');
    try { document.documentElement.style.overflow = ''; } catch (e) {}
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
    if (!installed && !neverAsk()) showLauncher(true);
  }

  /* Don't offer install over a full-screen welcome screen / splash.
     Treats the configured element as blocking while it is visible. */
  function gateBlocking() {
    if (!CFG.waitFor) return false;
    var el = null;
    try { el = document.querySelector(CFG.waitFor); } catch (e) { return false; }
    if (!el) return false;
    if (el.classList && el.classList.contains('hide')) return false;
    var cs;
    try { cs = window.getComputedStyle(el); } catch (e) { return false; }
    if (!cs || cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (parseFloat(cs.opacity) < 0.05) return false;
    return true;
  }

  var gateTimer = null;
  function whenGateClear(fn) {
    if (!gateBlocking()) { fn(); return; }
    if (gateTimer) return;
    var tries = 0;
    gateTimer = setInterval(function () {
      tries++;
      if (!gateBlocking()) {
        clearInterval(gateTimer); gateTimer = null; fn();
      } else if (tries > 600) {              // ~8 min: give up quietly
        clearInterval(gateTimer); gateTimer = null;
      }
    }, 800);
  }

  function neverAsk() { return read(KEY.never) === '1'; }
  function snoozed() {
    var until = parseInt(read(KEY.snooze) || '0', 10);
    return until > Date.now();
  }

  /* ------------------------------------------------------------- actions */
  function doInstall() {
    if (!deferredPrompt) { openSheet(); return; }
    var p = deferredPrompt;
    deferredPrompt = null;
    p.prompt();
    p.userChoice.then(function (res) {
      if (res && res.outcome === 'accepted') {
        markInstalled();
        closeSheet();
        render();
      } else {
        render();
        showLauncher(true);
      }
    }).catch(function () { render(); });
  }

  function markInstalled() {
    installed = true;
    store(KEY.installed, '1');
    try { showBanner(false); showLauncher(false); } catch (e) {}
    syncExternalButtons();
  }

  function copyLink() {
    var url = location.href.split('#')[0];
    function ok() { toast('🔗 Link copied — paste it in WhatsApp to share.'); }
    function fail() { toast('Copy this link: ' + url); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(ok, function () { legacyCopy(url) ? ok() : fail(); });
    } else { legacyCopy(url) ? ok() : fail(); }
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, text.length);
      var done = document.execCommand('copy');
      document.body.removeChild(ta);
      return done;
    } catch (e) { return false; }
  }

  function shareApp() {
    var url = location.href.split('#')[0];
    if (navigator.share) {
      navigator.share({
        title: CFG.fullName,
        text: CFG.appName + ' — ' + CFG.tagline,
        url: url
      }).catch(function () {});
    } else {
      copyLink();
    }
  }

  function escapeInApp() {
    var here = location.href;
    var hostPart = here.replace(/^https?:\/\//, '');
    var target = '';
    if (P.android) {
      target = 'intent://' + hostPart + '#Intent;scheme=https;package=com.android.chrome;' +
               'S.browser_fallback_url=' + encodeURIComponent(here) + ';end';
    } else if (P.ios) {
      target = 'x-web-search://';
    }
    if (target) {
      try { window.location.href = target; } catch (e) {}
    }
    toast(P.ios
      ? 'Tap ⋯ (or Share) in the corner and choose “Open in Safari”, then follow the steps.'
      : 'Tap ⋮ → “Open in browser” (Chrome), then tap Install.');
    copyLink();
  }

  function updateApp() {
    try {
      if (swReg && swReg.waiting) {
        swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
        var reload = function () { location.reload(); };
        navigator.serviceWorker.addEventListener('controllerchange', reload, { once: true });
        setTimeout(reload, 1200);
      } else {
        location.reload();
      }
    } catch (e) { location.reload(); }
  }

  function toast(msg) {
    try {
      mount();
      var t = shadow && shadow.querySelector('.jtoast');
      if (!t) {
        t = document.createElement('div');
        t.className = 'jtoast';
        t.style.cssText = 'position:fixed;left:50%;bottom:calc(80px + env(safe-area-inset-bottom,0px));' +
          'transform:translateX(-50%);max-width:88vw;background:#0f172a;color:#fff;padding:11px 15px;' +
          'border-radius:12px;font:600 13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
          'box-shadow:0 14px 34px rgba(6,12,30,.45);z-index:2147483005;pointer-events:auto;text-align:center;' +
          'opacity:0;transition:opacity .2s ease';
        shadow.appendChild(t);
      }
      t.textContent = msg;
      t.style.opacity = '1';
      clearTimeout(t._h);
      t._h = setTimeout(function () { t.style.opacity = '0'; }, 3600);
    } catch (e) {}
  }

  function syncExternalButtons() {
    var btns = document.querySelectorAll('[data-jcrgm-install-btn]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].style.display = installed ? 'none' : '';
    }
  }

  /* ---------------------------------------------------------------- events */
  function onAction(act, ev) {
    switch (act) {
      case 'open':   openSheet(); break;
      case 'close':  closeSheet(); break;
      case 'install': doInstall(); break;
      case 'escape': escapeInApp(); break;
      case 'copy':   copyLink(); break;
      case 'share':  shareApp(); break;
      case 'update': updateApp(); break;
      case 'launch':
        try { window.location.href = BASE + 'index.html'; } catch (e) {}
        break;
      case 'snooze':
        store(KEY.snooze, String(Date.now() + CFG.snoozeDays * 864e5));
        showBanner(false);
        closeSheet();
        if (!installed) showLauncher(true);
        break;
      case 'never':
        store(KEY.never, '1');
        store(KEY.snooze, String(Date.now() + 3650 * 864e5));
        showBanner(false); closeSheet(); showLauncher(false);
        toast('Okay — you can still install any time from the browser menu.');
        break;
    }
  }

  function bind() {
    if (!shadow) return;
    shadow.addEventListener('click', function (e) {
      var el = e.target;
      while (el && el !== shadow && !el.getAttribute) el = el.parentNode;
      if (!el || el === shadow) return;
      var act = el.getAttribute && el.getAttribute('data-act');
      if (act) { e.preventDefault(); e.stopPropagation(); onAction(act, e); }
    }, false);

    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && sheetOpen) closeSheet();
    });
    if (host) host.style.pointerEvents = 'none';
  }

  /* ----------------------------------------------------- auto-offer logic */
  function autoOffer() {
    if (!CFG.auto || installed || neverAsk() || snoozed() || sheetOpen) return;
    mount();
    if (!mounted) return;
    // wait until the welcome screen is gone before interrupting
    whenGateClear(function () {
      if (!installed && !snoozed() && !sheetOpen) showBanner(true);
    });
  }

  function scheduleAutoOffer() {
    if (!CFG.auto || installed || neverAsk()) return;
    var visits = parseInt(read(KEY.visits) || '0', 10) + 1;
    store(KEY.visits, String(visits));
    if (snoozed()) { showLauncher(true); return; }
    var delay = visits === 1 ? CFG.delay : Math.min(4500, CFG.delay);
    setTimeout(autoOffer, delay);
  }

  /* --------------------------------------------------------------- boot */
  function boot() {
    mount();
    bind();
    syncExternalButtons();
    if (installed) { showBanner(false); showLauncher(false); return; }
    scheduleAutoOffer();
    if (read(KEY.seenSheet) === '1') showLauncher(true);   // returning visitor: keep a way in
    if (deferredPrompt) showLauncher(true);
  }

  /* --------------------------------------------------------- install event */
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    try { if (mounted) render(); } catch (err) {}
    showLauncher(true);
    if (!installed && CFG.auto && !neverAsk() && !snoozed() && !sheetOpen) {
      setTimeout(function () { if (!sheetOpen) showBanner(true); }, 1400);
    }
  });

  window.addEventListener('appinstalled', function () {
    markInstalled();
    try { render(); openSheet(); } catch (e) {}
    toast('🎉 ' + CFG.appName + ' installed — look for the icon on your home screen.');
  });

  /* ------------------------------------------------------- service worker */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return;    // needs http(s), not file://
    try {
      navigator.serviceWorker.register(CFG.sw, { scope: './' }).then(function (reg) {
        swReg = reg;
        if (reg.waiting && navigator.serviceWorker.controller) markUpdate();
        reg.addEventListener('updatefound', function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', function () {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) markUpdate();
          });
        });
      }).catch(function () {});
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (updateReady) { /* already reloading */ }
      });
    } catch (e) {}
  }

  function markUpdate() {
    mount();
    updateReady = true;
    var bar = q('.upd');
    if (bar) bar.classList.add('show');
  }

  /* ------------------------------------------------------------- public API */
  var API = {
    open: openSheet,
    close: closeSheet,
    prompt: function () { if (deferredPrompt) { doInstall(); } else { openSheet(); } },
    canPrompt: function () { return !!deferredPrompt; },
    isInstalled: function () { return installed; },
    share: shareApp,
    copyLink: copyLink,
    platform: P,
    config: CFG,
    _debug: { render: render, markInstalled: markInstalled }
  };
  window.JCRGMInstall = API;

  /* --------------------------------------------------------------- start */
  registerSW();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* re-check standalone (some browsers only report it after first paint) */
  setTimeout(function () {
    if (!installed && isStandalone()) { markInstalled(); try { render(); } catch (e) {} }
  }, 1200);
})();
