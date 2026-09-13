// Runs the REAL inline <script> from uploads/index.html against DOM stubs,
// then exercises the membership-number engine, WhatsApp builder, local
// register, verification and draft auto-save.
const fs = require('fs');
const html = fs.readFileSync('/home/user/uploads/index.html', 'utf8');

// pull all inline scripts (no src=), pick the big app script
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts.sort((a, b) => b.length - a.length)[0];
if (!/MEMBERSHIP NUMBER ENGINE/.test(code)) throw new Error('main app script not extracted');
if (/memberName/.test(html)) throw new Error('stale memberName references still present');

// ---- stubs ----
const store = {};
const opened = [];
const clicked = [];
class El {
  constructor() {
    this.id = ''; this.tagName = 'DIV';
    this.style = {}; this.dataset = {}; this.value = ''; this.checked = false;
    this.type = 'text'; this.files = []; this._t = ''; this._h = ''; this.href = ''; this.download = '';
    this.classList = { add() {}, remove() {}, toggle() {} };
    this.cells = [{ innerText: 'x' }, { innerText: 'y' }];
  }
  addEventListener() {} removeEventListener() {} scrollIntoView() {} reset() {}
  focus() {} select() {} click() { clicked.push(this.id || this.tagName); }
  checkValidity() { return true; } reportValidity() {}
  get innerText() { return this._t; } set innerText(v) { this._t = v; }
  get textContent() { return this._t; } set textContent(v) { this._t = v; }
  get innerHTML() { return this._h; } set innerHTML(v) { this._h = v; }
}
const els = new Map();
const byId = id => {
  if (!els.has(id)) { const e = new El(); e.id = id; if (id === 'mPhoto') e.type = 'file'; els.set(id, e); }
  return els.get(id);
};
const document = {
  readyState: 'complete',
  documentElement: new El(), hidden: false, body: { appendChild() {}, removeChild() {} },
  getElementById: byId, querySelector: () => null,
  querySelectorAll: sel => String(sel).includes('membershipForm') ? [...els.values()] : [],
  createElement: tag => { const e = new El(); e.tagName = (tag || '').toUpperCase(); return e; },
  addEventListener() {}, removeEventListener() {}, appendChild() {}, removeChild() {},
};
const winWrites = [];
const fakeWin = {
  document: { open() {}, write(h) { winWrites.push(String(h)); }, close() {} },
  focus() {}, print() {},
};
const win = {
  matchMedia: () => ({ matches: true }),
  addEventListener() {},
  open: (u, name, feats) => { if (u === '') return fakeWin; opened.push(u); return null; },
  location: { href: '', protocol: 'http:' },
  AudioContext: undefined, webkitAudioContext: undefined,
  innerWidth: 1200, innerHeight: 800,
};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => (store[k] = String(v)), removeItem: k => delete store[k] };
const navigator = { clipboard: null, sendBeacon: () => {} };
let alerts = [];

const api = new Function('window', 'document', 'localStorage', 'navigator', 'location', 'setInterval', 'alert', 'confirm',
  code + `
  ; return { normPhone, memberNumberFor, lookupMemberId, memberStore, bulkGenerate, sendMembership,
             renderMemberId, renderRegister, registerLoad, registerAdd, registerCSV, registerRemove,
             downloadRegisterCSV, downloadBulkCSV, sendRegisterToWhatsApp, verifyMemberNumber,
             saveMembershipDraft, restoreMembershipDraft, printMemberCard,
             get bulkCsv(){ return bulkCsv; } };
  `)(win, document, localStorage, navigator, { protocol: 'http:' }, () => {}, m => alerts.push(m), () => true);

const { normPhone, memberNumberFor, lookupMemberId, memberStore, bulkGenerate, sendMembership,
        renderRegister, registerLoad, registerAdd, registerCSV, registerRemove,
        downloadRegisterCSV, downloadBulkCSV, sendRegisterToWhatsApp, verifyMemberNumber,
        saveMembershipDraft, restoreMembershipDraft, printMemberCard } = api;
let pass = 0, fail = 0;
const t = (name, cond, got) => { cond ? pass++ : (fail++, console.log('FAIL:', name, '=>', got)); if (cond) console.log('ok  :', name); };

// --- phone normalisation ---
t('0971415665 normalised', normPhone('0971415665') === '260971415665', normPhone('0971415665'));
t('+260 spaced normalised', normPhone('+260 97 141 56 65') === '260971415665', normPhone('+260 97 141 56 65'));
t('971415665 normalised', normPhone('971415665') === '260971415665', normPhone('971415665'));
t('garbage rejected', normPhone('12345') === '', normPhone('12345'));

// --- number engine ---
const n1 = memberNumberFor('0971415665'), n1b = memberNumberFor('+260971415665');
const n2 = memberNumberFor('0760528887');
t('format JCRGM-XXXXXXX', /^JCRGM-[0-9A-Z]{7}$/.test(n1), n1);
t('deterministic across formats', n1 === n1b, n1 + ' vs ' + n1b);
t('different phones -> different numbers', n1 !== n2, n1 + ' vs ' + n2);

// --- standalone ID lookup (existing members with the app) ---
byId('mcPhone').value = '0979554970';
lookupMemberId();
const rec = memberStore();
t('lookup saved record', rec && rec.number === memberNumberFor('0979554970'), JSON.stringify(rec));
t('card rendered with number', byId('mcNumber')._t === rec.number, byId('mcNumber')._t);
t('ID strip svg drawn', /<svg/.test(byId('mcBarcode')._h), byId('mcBarcode')._h.slice(0, 40));
t('auto field prefilled', byId('mMemberNo').value === rec.number, byId('mMemberNo').value);
t('card status pending before registration', byId('mcStatus')._t === 'Pending registration', byId('mcStatus')._t);

// --- bulk desk ---
byId('bulkPhones').value = '0971415665, Chileshe Banda\n0760528887\n+260 97 955 4970, Mary Chanda\n12345';
bulkGenerate();
const bulkHtml = byId('bulkResult')._h;
t('bulk: 3 valid generated', /3 membership number\(s\) generated \(1 invalid skipped\)/.test(bulkHtml), bulkHtml.slice(0, 120));
t('bulk: valid rows match engine', bulkHtml.includes(n1) && bulkHtml.includes(n2), 'missing codes');
t('bulk: name column rendered', /Chileshe Banda/.test(bulkHtml) && /Mary Chanda/.test(bulkHtml), 'missing names');
const bCsv = api.bulkCsv;
t('bulk: csv has header + 3 rows', bCsv.split('\r\n').length === 4 && bCsv.startsWith('phone,name,number'), bCsv.slice(0, 80));
t('bulk: csv rows carry number', bCsv.includes(n1) && bCsv.includes(n2), 'missing codes');
downloadBulkCSV();
t('bulk csv download clicked anchor', clicked[clicked.length - 1] === 'A', JSON.stringify(clicked));

// --- full registration message ---
byId('mFirstName').value = 'Chileshe'; byId('mLastName').value = 'Banda';
byId('mPhone').value = '0971415665'; byId('mEmail').value = 'chile@mail.com';
byId('mDOB').value = '1992-05-14'; byId('mGender').value = 'Male';
byId('mResidence').value = 'Chelstone'; byId('mTown').value = 'Lusaka'; byId('mDistrict').value = 'Lusaka';
byId('mIDNumber').value = '123456/10/1';
byId('mConsent').type = 'checkbox'; byId('mConsent').checked = true;
byId('mSaved').value = 'Yes'; byId('mBaptism').value = 'Yes — by immersion';
byId('mNextOfKin').value = 'Mary Banda'; byId('mNextOfKinPhone').value = '0966123456';
byId('mAvailMorning').type = 'checkbox'; byId('mAvailMorning').checked = true;
sendMembership();
t('WhatsApp URL opened', opened.length === 1, opened.length);
const msg = decodeURIComponent(opened[0].split('text=')[1]);
for (const probe of ['Membership Number: ' + n1, 'Chileshe Banda', '1992-05-14', 'Chelstone', '123456/10/1',
  'chile@mail.com', 'Water Baptism', 'Next of Kin: Mary Banda', 'Sunday Morning',
  'Truthful Info & Data Consent: Confirmed', 'Submitted:'])
  t('msg has "' + probe + '"', msg.includes(probe), 'missing');
t('msg not absurdly long for wa.me', msg.length < 3900, msg.length);
t('record persisted with since date', /\d{4}-\d{2}-\d{2}/.test(String(memberStore().since)), memberStore().since);

// --- local register ---
const regList = registerLoad();
t('register: 1 record stored', regList.length === 1, regList.length);
const r0 = regList[0] || {};
t('register: fields correct', r0.number === n1 && r0.name === 'Chileshe Banda' && r0.phone === '260971415665' && r0.dob === '1992-05-14', JSON.stringify(r0));
t('register: table shows number', byId('regTableWrap')._h.includes(n1), 'missing');
t('register: count updated', byId('regCount')._t === '1', byId('regCount')._t);
t('register: card status Registered ✓', byId('mcStatus')._t === 'Registered ✓', byId('mcStatus')._t);
registerAdd({ number: n2, name: '<b>evil</b>', phone: '260760528887', since: '2026-01-01' });
t('register: dedupe by number on re-add', registerLoad().length === 2, registerLoad().length);
t('register: XSS escaped in table', !byId('regTableWrap')._h.includes('<b>') && byId('regTableWrap')._h.includes('&lt;b&gt;'), byId('regTableWrap')._h.slice(0, 200));
t('register: count now 2', byId('regCount')._t === '2', byId('regCount')._t);
const csv = registerCSV();
t('csv: header row', csv.startsWith('number,name,phone,dob,gender'), csv.split('\r\n')[0]);
t('csv: quoted name', csv.includes('"Chileshe Banda"'), csv.slice(0, 120));
t('csv: 3 lines (header + 2)', csv.split('\r\n').length === 3, csv.split('\r\n').length);
downloadRegisterCSV();
t('csv download triggered anchor click', clicked.includes('A'), JSON.stringify(clicked));
opened.length = 0;
sendRegisterToWhatsApp();
const bak = decodeURIComponent((opened[0] || '').split('text=')[1] || '');
t('backup: opens WhatsApp with counts', /1 members|\(2 members\)/.test(bak) && bak.includes(n1), bak.slice(0, 100));

// --- register: search, remove, print ---
byId('regSearch').value = 'zzz-no-match'; renderRegister();
t('register: no-match message', /No members match your search/.test(byId('regTableWrap')._h), byId('regTableWrap')._h.slice(0, 80));
byId('regSearch').value = 'Chelstone'; renderRegister();
t('register: area search filters', byId('regTableWrap')._h.includes(n1) && !byId('regTableWrap')._h.includes(n2), 'filter failed');
t('register: count shows 1 of 2', byId('regCount')._t === '1 of 2', byId('regCount')._t);
byId('regSearch').value = '0971415665'; renderRegister();
t('register: phone digits search works', byId('regTableWrap')._h.includes(n1), 'miss');
byId('regSearch').value = ''; renderRegister();
t('register: clear search restores all', byId('regCount')._t === '2', byId('regCount')._t);
registerRemove(n2);
t('register: member removed', registerLoad().length === 1, registerLoad().length);
t('register: other member untouched', registerLoad()[0].number === n1, JSON.stringify(registerLoad()[0]));
t('card still Registered ✓ (own record kept)', byId('mcStatus')._t === 'Registered ✓', byId('mcStatus')._t);
printMemberCard();
t('print: popup card html written', winWrites.length === 1 && winWrites[0].includes(n1) && winWrites[0].includes('86mm') && winWrites[0].includes('Chileshe Banda'), JSON.stringify(winWrites.map(w => w.length)));
byId('mFirstName').value = '<b>'; byId('mLastName').value = 'Banda';
lookupMemberId(); printMemberCard();
t('print: malicious name escaped', winWrites.length === 2 && winWrites[1].includes('&lt;b&gt; Banda') && !winWrites[1].includes('<b>Banda'), winWrites[1].slice(0, 160));
byId('mFirstName').value = 'Chileshe'; // restore for later tests

// --- verification ---
byId('verifyNumber').value = n1.toLowerCase().replace('jcrgm-', 'JCRGM '); // messy input tolerated
byId('verifyPhone').value = '0971415665';
verifyMemberNumber();
t('verify: genuine accepted', /GENUINE/.test(byId('verifyResult')._h), byId('verifyResult')._h);
byId('verifyPhone').value = '0760528887';
verifyMemberNumber();
t('verify: wrong phone rejected', /does NOT match/.test(byId('verifyResult')._h), byId('verifyResult')._h);
byId('verifyPhone').value = '';
verifyMemberNumber();
t('verify: format-only ok', /Format &.*check digit valid/.test(byId('verifyResult')._h), byId('verifyResult')._h);
byId('verifyNumber').value = n1.slice(0, -1) + (n1.slice(-1) === 'A' ? 'B' : 'A'); // bad check digit
verifyMemberNumber();
t('verify: bad check digit caught', /Check digit failed/.test(byId('verifyResult')._h), byId('verifyResult')._h);
byId('verifyNumber').value = 'HELLO';
verifyMemberNumber();
t('verify: bad format caught', /Invalid format/.test(byId('verifyResult')._h), byId('verifyResult')._h);

// --- draft auto-save ---
byId('mFirstName').value = 'DraftTest';
saveMembershipDraft();
t('draft: saved non-empty fields', /DraftTest/.test(store['jcrgm_form_draft_v1'] || ''), store['jcrgm_form_draft_v1']);
t('draft: file input excluded', !/"mPhoto"/.test(store['jcrgm_form_draft_v1'] || ''), 'mPhoto leaked');
byId('mFirstName').value = '';
t('draft: restore returns true', restoreMembershipDraft() === true, 'false');
t('draft: value restored', byId('mFirstName').value === 'DraftTest', byId('mFirstName').value);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
