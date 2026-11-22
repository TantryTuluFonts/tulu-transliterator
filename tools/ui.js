// ============================================================
// USER INTERFACE
// Everything above this line is the conversion engine, unchanged.
// The interface below only reads and writes text through convert().
// ============================================================

const SCRIPT_NAMES = { iast: 'IAST', deva: 'Devanāgarī', kan: 'Kannaḍa', mal: 'Malayāḷam' };
const SCRIPT_SUB   = { iast: 'IAST romanization', deva: 'Devanagari Unicode', kan: 'Kannada Unicode', mal: 'Malayalam Unicode' };
const TULU_NAME = 'AccTantra';
const TULU_SUB  = 'Mallige font encoding';
const VALID_DIRS = new Set(['tulu-iast','iast-tulu','tulu-deva','deva-tulu','tulu-kan','kan-tulu','tulu-mal','mal-tulu']);

const PLACEHOLDERS = {
  'tulu-iast': 'tuLuqAX berel',
  'iast-tulu': 'Type IAST text',
  'tulu-deva': 'tuLuqAX berel',
  'deva-tulu': 'Type Devanāgarī text',
  'tulu-kan':  'tuLuqAX berel',
  'kan-tulu':  'Type Kannaḍa text',
  'tulu-mal':  'tuLuqAX berel',
  'mal-tulu':  'Type Malayāḷam text',
};

const $ = (id) => document.getElementById(id);
const inputText = $('inputText'), outputText = $('outputText');
const inputCount = $('inputCount'), outputCount = $('outputCount');
const inputLabel = $('inputLabel'), inputScript = $('inputScript');
const outputLabel = $('outputLabel'), outputScript = $('outputScript');
const dirText = $('dirText');
const copyBtn = $('copyBtn'), shareBtn = $('shareBtn'), swapBtn = $('swapBtn'), clearBtn = $('clearBtn');
const zwnjCheck = $('zwnjCheck'), nasalCheck = $('nasalCheck'), fontCheck = $('fontCheck');
const chips = Array.from(document.querySelectorAll('#scriptChips .chip'));

let script = 'iast';
let fromTulu = false;            // the default direction is IAST → AccTantra
let debounceTimer = null, hashTimer = null;


const currentDir = () => (fromTulu ? 'tulu-' + script : script + '-tulu');
const plural = (n) => n + (n === 1 ? ' character' : ' characters');

function store(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

function applyTuluFont() {
  const on = fontCheck.checked;
  inputText.classList.toggle('tulu-font', on && fromTulu);
  outputText.classList.toggle('tulu-font', on && !fromTulu);
  // Larger type when the output is a Unicode Indic script (not IAST, not AccTantra)
  outputText.classList.toggle('large-script', fromTulu && script !== 'iast');
}

function doConvert() {
  const text = inputText.value;
  inputCount.textContent = plural(text.length);
  const out = convert(text, currentDir());
  outputText.textContent = out;
  outputCount.textContent = plural(out.length);
}

function refresh() {
  const dir = currentDir();
  const sName = SCRIPT_NAMES[script];
  inputLabel.textContent  = 'Input · ' + (fromTulu ? TULU_NAME : sName);
  inputScript.textContent = fromTulu ? TULU_SUB : SCRIPT_SUB[script];
  outputLabel.textContent  = 'Output · ' + (fromTulu ? sName : TULU_NAME);
  outputScript.textContent = fromTulu ? SCRIPT_SUB[script] : TULU_SUB;
  dirText.textContent = (fromTulu ? TULU_NAME : sName) + ' → ' + (fromTulu ? sName : TULU_NAME);
  inputText.placeholder = PLACEHOLDERS[dir];
  chips.forEach((c) => c.setAttribute('aria-checked', String(c.dataset.script === script)));
  applyTuluFont();
  doConvert();
}

// ---- script chips, swap, clear ----
chips.forEach((chip) => chip.addEventListener('click', () => {
  if (chip.dataset.script === script) return;
  script = chip.dataset.script;
  if (!fromTulu) inputText.value = '';   // the input script changed, so the old text no longer applies
  refresh(); scheduleHash();
}));

swapBtn.addEventListener('click', () => {
  const carried = outputText.textContent;
  fromTulu = !fromTulu;
  inputText.value = carried;
  refresh(); scheduleHash(); inputText.focus();
});

clearBtn.addEventListener('click', () => {
  inputText.value = ''; outputText.textContent = '';
  inputCount.textContent = plural(0); outputCount.textContent = plural(0);
  scheduleHash(); inputText.focus();
});

inputText.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { doConvert(); scheduleHash(); }, 80);
});

// ---- copy and share ----
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
    document.body.removeChild(ta);
  });
}
function flash(btn, label) {
  const old = btn.dataset.label || btn.textContent;
  btn.dataset.label = old; btn.textContent = label; btn.classList.add('ok');
  setTimeout(() => { btn.textContent = old; btn.classList.remove('ok'); }, 1500);
}
copyBtn.addEventListener('click', () => {
  const text = outputText.textContent;
  if (!text) return;
  copyText(text).then(() => flash(copyBtn, 'Copied'), () => flash(copyBtn, 'Press Ctrl+C'));
});

function shareUrl() {
  const q = inputText.value;
  const base = location.origin + location.pathname;
  return q ? base + '#d=' + currentDir() + '&q=' + encodeURIComponent(q) : base + '#d=' + currentDir();
}
function scheduleHash() {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    try { history.replaceState(null, '', inputText.value ? shareUrl().replace(location.origin + location.pathname, '') : location.pathname + location.search); } catch (e) {}
  }, 400);
}
shareBtn.addEventListener('click', () => {
  copyText(shareUrl()).then(() => flash(shareBtn, 'Link copied'), () => flash(shareBtn, 'Copy failed'));
});

function restoreFromHash() {
  const h = location.hash.replace(/^#/, '');
  if (!h) return;
  const p = new URLSearchParams(h);
  const d = p.get('d');
  if (d && VALID_DIRS.has(d)) {
    const [a, b] = d.split('-');
    fromTulu = (a === 'tulu');
    script = fromTulu ? b : a;
  }
  const q = p.get('q');
  if (q) inputText.value = q;
}

// ---- options ----
function saveOptions() {
  store('tt-opts', JSON.stringify({ font: fontCheck.checked, zwnj: zwnjCheck.checked, nasal: nasalCheck.checked }));
}
function loadOptions() {
  try {
    const o = JSON.parse(load('tt-opts') || '{}');
    if (typeof o.font === 'boolean') fontCheck.checked = o.font;
    if (typeof o.zwnj === 'boolean') zwnjCheck.checked = o.zwnj;
    if (typeof o.nasal === 'boolean') nasalCheck.checked = o.nasal;
  } catch (e) {}
  preserveZwnj = zwnjCheck.checked;
  resolveNasals = !nasalCheck.checked;
}
zwnjCheck.addEventListener('change', () => { preserveZwnj = zwnjCheck.checked; saveOptions(); doConvert(); });
nasalCheck.addEventListener('change', () => { resolveNasals = !nasalCheck.checked; saveOptions(); doConvert(); });
fontCheck.addEventListener('change', () => { saveOptions(); applyTuluFont(); });

// ---- theme ----
$('themeBtn').addEventListener('click', () => {
  const root = document.documentElement;
  const cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next); store('tt-theme', next);
});

// ---- quick reference: add a glyph column, add filtering ----
(function buildReference() {
  document.querySelectorAll('.ref-table tr').forEach((tr) => {
    const first = tr.cells[0];
    if (!first) return;
    const g = document.createElement('td');
    g.className = 'g';
    const keys = first.textContent.trim();
    if (keys && keys.indexOf('[') === -1) g.textContent = keys;
    first.after(g);
  });
  const search = $('refSearch'), empty = $('refEmpty');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let anyCard = false;
    document.querySelectorAll('#refGrid .ref-card').forEach((card) => {
      let any = false;
      card.querySelectorAll('.ref-table tr').forEach((tr) => {
        const hit = !q || tr.textContent.toLowerCase().indexOf(q) !== -1;
        tr.classList.toggle('hidden', !hit);
        if (hit) any = true;
      });
      card.classList.toggle('hidden', !any);
      if (any) anyCard = true;
    });
    empty.classList.toggle('hidden', anyCard);
  });
})();

// ---- start ----
loadOptions();
restoreFromHash();
refresh();
// A link pasted into an already open tab only changes the hash, so listen for that too.
window.addEventListener('hashchange', () => { restoreFromHash(); refresh(); });
// Some browsers put back the previous text after a reload without firing an input event,
// which left the counters at 0 and the output empty. Convert again once the page has settled.
window.addEventListener('load', doConvert);
window.addEventListener('pageshow', (e) => { if (e.persisted) doConvert(); });
