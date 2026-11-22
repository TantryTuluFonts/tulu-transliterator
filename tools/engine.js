// ============================================================
// FULL TULU TRANSLITERATION ENGINE (embedded)
// ============================================================

const VOWEL_INDEPENDENT = [
  ['AAMM','aṁ'],
  ['AAM', 'aṃ'],
  ['AAH', 'aḥ'],
  ['ARR', 'r̥̄'],
  ['Vll', 'ḹ'],
  ['VlX', 'l̥'],   // vocalic l matra form (standalone treated as ind.)
  ['Vl',  'l̥'],   // vocalic l independent
  ['eeA', 'ai'],
  ['EAa', 'ō'],
  ['eAa', 'o'],
  ['EA',  'ē'],
  ['eA',  'e'],
  ['OA',  'ǣ'],
  ['oA',  'æ'],
  ['AY',  'au'],
  ['AR',  'r̥'],
  ['AU',  'ū'],
  ['Au',  'u'],
  ['AI',  'ī'],
  ['Ai',  'i'],
  ['Aa',  'ā'],
  ['AA',  'a'],
];

// Consonant map: Mallige key -> IAST
const CONSONANT_MAP = [
  ['VZ', 'ḻ'],
  ['Vr', 'ṟ'],
  ['VP', 'f'],
  ['Vj', 'z'],
  ['Z',  'ṅ'],
  ['K',  'kh'],
  ['G',  'gh'],
  ['C',  'ch'],
  ['J',  'jh'],
  ['z',  'ñ'],
  ['Q',  'ṭh'],
  ['W',  'ḍh'],
  ['T',  'th'],
  ['D',  'dh'],
  ['P',  'ph'],
  ['B',  'bh'],
  ['L',  'ḷ'],
  ['k',  'k'],
  ['g',  'g'],
  ['c',  'c'],
  ['j',  'j'],
  ['q',  'ṭ'],
  ['w',  'ḍ'],
  ['N',  'ṇ'],
  ['t',  't'],
  ['d',  'd'],
  ['n',  'n'],
  ['p',  'p'],
  ['b',  'b'],
  ['m',  'm'],
  ['y',  'y'],
  ['r',  'r'],
  ['l',  'l'],
  ['v',  'v'],
  ['S',  'ś'],
  ['x',  'ṣ'],
  ['s',  's'],
  ['h',  'h'],
];

// Build reverse map (IAST -> Mallige) - first match wins
const IAST_TO_MALLIGE_CONS = {};
for (const [key, iast] of CONSONANT_MAP) {
  if (!IAST_TO_MALLIGE_CONS[iast]) IAST_TO_MALLIGE_CONS[iast] = key;
}

const IAST_TO_MALLIGE_VOW_IND = {};
for (const [seq, iast] of VOWEL_INDEPENDENT) {
  if (!IAST_TO_MALLIGE_VOW_IND[iast]) IAST_TO_MALLIGE_VOW_IND[iast] = seq;
}

// Explicit set of consonants that take the Sūryavirāma loop terminal (based on Primer Table 10.2 & 10.3)
const SURYAVIRAMA_CONS = new Set(['k','g','ṭ','ṇ','t','d','n','m','h','bh','ḷ','r']);

// Script vowel table: [iast, deva_ind, deva_mat, kan_ind, kan_mat, mal_ind, mal_mat]
const SCRIPT_VOWEL_TABLE = [
  ['a',   'अ',  '',   'ಅ',  '',   'അ',  ''],
  ['ā',   'आ',  'ा',  'ಆ',  'ಾ',  'ആ',  'ാ'],
  ['i',   'इ',  'ि',  'ಇ',  'ಿ',  'ഇ',  'ി'],
  ['ī',   'ई',  'ी',  'ಈ',  'ೀ',  'ഈ',  'ീ'],
  ['u',   'उ',  'ु',  'ಉ',  'ು',  'ഉ',  'ു'],
  ['ū',   'ऊ',  'ू',  'ಊ',  'ೂ',  'ഊ',  'ൂ'],
  ['r̥',   'ऋ',  'ृ',  'ಋ',  'ೃ',  'ഋ',  'ൃ'],
  ['r̥̄',   'ॠ',  'ॄ',  'ೠ',  'ೄ',  'ൠ',  'ൄ'],
  ['l̥',   'ऌ',  'ॢ',  'ಌ',  'ೢ',  'ഌ',  'ൢ'],
  ['ḹ',   'ॡ',  'ॣ',  'ೡ',  'ೣ',  'ൡ',  'ൣ'],
  ['e',   'ऎ',  'ॆ',  'ಎ',  'ೆ',  'എ',  'െ'],
  ['ē',   'ए',  'े',  'ಏ',  'ೇ',  'ഏ',  'േ'],
  ['æ',   'ऎ',  'ॆ',  'ಎ',  'ೆ',  'എ',  'െ'],
  ['ǣ',   'ए',  'े',  'ಏ',  'ೇ',  'ഏ',  'േ'],
  ['ai',  'ऐ',  'ै',  'ಐ',  'ೈ',  'ഐ',  'ൈ'],
  ['o',   'ऒ',  'ॊ',  'ಒ',  'ೊ',  'ഒ',  'ൊ'],
  ['ō',   'ओ',  'ो',  'ಓ',  'ೋ',  'ഓ',  'ോ'],
  ['au',  'औ',  'ौ',  'ಔ',  'ೌ',  'ഔ',  'ൌ'],
  ['aṃ',  'अं', 'ं',  'ಅಂ', 'ಂ',  'അം', 'ം'],
  ['aḥ',  'अः', 'ः',  'ಅಃ', 'ಃ',  'അഃ', 'ഃ'],
  ['aṁ',  'अँ', 'ँ',  'ಅಁ', 'ಁ',  'അഁ', 'ഁ'],
  ['ụ',   '',   '',   '',   '',   '',   ''],  // reduced vowel - no script form
];

// Script consonant table: [iast, deva, kan, mal]
const SCRIPT_CONS_TABLE = [
  ['k',  'क', 'ಕ', 'ക'],
  ['kh', 'ख', 'ಖ', 'ഖ'],
  ['g',  'ग', 'ಗ', 'ഗ'],
  ['gh', 'घ', 'ಘ', 'ഘ'],
  ['ṅ',  'ङ', 'ಙ', 'ങ'],
  ['c',  'च', 'ಚ', 'ച'],
  ['ch', 'छ', 'ಛ', 'ഛ'],
  ['j',  'ज', 'ಜ', 'ജ'],
  ['jh', 'झ', 'ಝ', 'ഝ'],
  ['ñ',  'ञ', 'ಞ', 'ഞ'],
  ['ṭ',  'ट', 'ಟ', 'ട'],
  ['ṭh', 'ठ', 'ಠ', 'ഠ'],
  ['ḍ',  'ड', 'ಡ', 'ഡ'],
  ['ḍh', 'ढ', 'ಢ', 'ഢ'],
  ['ṇ',  'ण', 'ಣ', 'ണ'],
  ['t',  'त', 'ತ', 'ത'],
  ['th', 'थ', 'ಥ', 'ഥ'],
  ['d',  'द', 'ದ', 'ദ'],
  ['dh', 'ध', 'ಧ', 'ധ'],
  ['n',  'न', 'ನ', 'ന'],
  ['p',  'प', 'ಪ', 'പ'],
  ['ph', 'फ', 'ಫ', 'ഫ'],
  ['b',  'ब', 'ಬ', 'ബ'],
  ['bh', 'भ', 'ಭ', 'ഭ'],
  ['m',  'म', 'ಮ', 'മ'],
  ['y',  'य', 'ಯ', 'യ'],
  ['r',  'र', 'ರ', 'ര'],
  ['l',  'ल', 'ಲ', 'ല'],
  ['v',  'व', 'ವ', 'വ'],
  ['ḷ',  'ळ', 'ಳ', 'ള'],
  ['ś',  'श', 'ಶ', 'ശ'],
  ['ṣ',  'ष', 'ಷ', 'ഷ'],
  ['s',  'स', 'ಸ', 'സ'],
  ['h',  'ह', 'ಹ', 'ഹ'],
  ['ḻ',  'ळ', 'ೞ', 'ഴ'],
  ['ṟ',  'ऱ', 'ಱ', 'റ'],
  ['f',  'फ़','ಫ', 'ഫ'],
  ['z',  'ज़','ಜ', 'ജ'],
];

const VIRAMA_MAP = { deva: '्', kan: '್', mal: '്' };

// ============================================================
// PARSER: Mallige -> Token stream
// ============================================================

function parseMallige(input) {
  const tokens = [];
  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];

    if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
      tokens.push({ type: 'space', char: ch }); i++; continue;
    }

    // Punctuation
    if (ch === '.' && i+1 < len && input[i+1] === '.') {
      tokens.push({ type: 'punct', char: '॥' }); i+=2; continue;
    }
    if (ch === '.') { tokens.push({ type: 'punct', char: '।' }); i++; continue; }
    if (ch === ',') { tokens.push({ type: 'punct', char: ',' }); i++; continue; }

    // Try independent vowel
    const vowelM = matchIndepVowel(input, i);
    if (vowelM) {
      // Check: if iast='a' and next char is A (chandravirāma) -> it's ụ (reduced vowel)
      // Note: X is pure ZWNJ, not virama — only A triggers reduced vowel.
      if (vowelM.iast === 'a' && i + vowelM.len < len) {
        const nx = input[i + vowelM.len];
        if (nx === 'A') {
          tokens.push({ type: 'vowel', iast: 'ụ' });
          i += vowelM.len + 1;
          continue;
        }
      }
      tokens.push({ type: 'vowel', iast: vowelM.iast });
      i += vowelM.len;
      // Check for trailing diacritic (M/H/MM) after independent vowel
      if (i < len) {
        if (input.startsWith('MM', i)) {
          tokens[tokens.length - 1].iast += 'ṁ'; i += 2;
        } else if (input[i] === 'M') {
          tokens[tokens.length - 1].iast += 'ṃ'; i++;
        } else if (input[i] === 'H') {
          tokens[tokens.length - 1].iast += 'ḥ'; i++;
        }
      }
      continue;
    }

    // Try syllable (possibly starting with pre-base matra)
    const sylResult = parseSyllable(input, i);
    if (sylResult) {
      tokens.push(sylResult.token);
      i += sylResult.consumed;
      continue;
    }

    // Standalone X = ZWNJ (not a virama; virama is always A / AX)
    if (ch === 'X') {
      tokens.push({ type: 'raw', char: '\u200C' });
      i++;
      continue;
    }

    // Passthrough
    tokens.push({ type: 'raw', char: ch });
    i++;
  }
  return tokens;
}

function matchIndepVowel(input, pos) {
  for (const [seq, iast] of VOWEL_INDEPENDENT) {
    if (input.startsWith(seq, pos)) return { iast, len: seq.length };
  }
  return null;
}

function matchCons(input, pos) {
  for (const [key, iast] of CONSONANT_MAP) {
    if (input.startsWith(key, pos)) return { iast, len: key.length };
  }
  return null;
}

function matchPostMatra(input, pos) {
  const postList = [
    ['MM', 'ṁ'], ['RR', 'r̥̄'], ['VllX', 'ḹ'], ['VlX', 'l̥'],
    ['I', 'ī'], ['i', 'i'], ['U', 'ū'], ['u', 'u'],
    ['a', 'ā'], ['R', 'r̥'],
  ];
  for (const [seq, iast] of postList) {
    if (input.startsWith(seq, pos)) return { iast, len: seq.length };
  }
  return null;
}

function parseSyllable(input, startPos) {
  let i = startPos;
  const len = input.length;

  // Pre-base matra check (typed BEFORE consonant)
  let preMatra = null;
  const preBases = [
    ['EE', 'ai'], ['ee', 'ai'], ['E', 'ē'], ['O', 'ǣ'], ['e', 'e'], ['o', 'æ']
  ];
  for (const [seq, iast] of preBases) {
    if (input.startsWith(seq, i)) {
      preMatra = { seq, iast };
      i += seq.length;
      break;
    }
  }

  // Must find at least one consonant
  const c0 = matchCons(input, i);
  if (!c0) return null; // no consonant

  const consonants = [];
  i += c0.len;

  // Check repha AFTER first consonant
  // f = repha marker: means there was an r before this consonant
  // In IAST output: r + consonant(s) + vowel
  let hasRepha = false;
  if (i < len && input[i] === 'f') {
    hasRepha = true; i++;
  }

  consonants.push(c0.iast);

  // Collect conjunct cluster: A + consonant (+ optional repha)
  while (i < len && input[i] === 'A') {
    const nc = matchCons(input, i + 1);
    if (nc) {
      consonants.push(nc.iast);
      i += 1 + nc.len;
      // repha after next consonant?
      if (i < len && input[i] === 'f') { hasRepha = true; i++; }
    } else {
      break;
    }
  }

  // If repha, r was before the FIRST consonant
  if (hasRepha) consonants.unshift('r');

  // X is never a virama by itself — only A is. Standalone X is ZWNJ and
  // will be handled by parseMallige as a raw token. The AX combination
  // (virama + ZWNJ) is handled below in the 'A' branch.
  let zwnjAfter = false;

  // Determine vowel
  let vowel = null;
  let diacritic = null;

  if (preMatra) {
    const pm = preMatra.iast;
    if (pm === 'e' && i < len && input[i] === 'a') { vowel = 'o'; i++; }
    else if (pm === 'ē' && i < len && input[i] === 'a') { vowel = 'ō'; i++; }
    else if (pm === 'ē' && i < len && input[i] === 'Y') { vowel = 'au'; i++; }
    else vowel = pm;
  } else {
    // Check diacritics BEFORE post-matra (M, H, MM come after vowel)
    const pm = matchPostMatra(input, i);
    if (pm) {
      if (pm.iast === 'ṃ' || pm.iast === 'ḥ' || pm.iast === 'ṁ') {
        vowel = 'a'; // inherent vowel + diacritic
        diacritic = pm.iast;
        i += pm.len;
      } else {
        vowel = pm.iast;
        i += pm.len;
      }
    } else if (i < len && input[i] === 'A') {
      // Uppercase A = chandravirāma = no vowel (explicit suppression for śirovarṇas)
      vowel = null;
      i++; // consume the A
      // If A is followed by X, consume it too — but first check if X is a ZWNJ
      // (i.e. a consonant or pre-matra follows after the X)
      if (i < len && input[i] === 'X') {
        i++; // consume X
        const nextIsCons = !!matchCons(input, i);
        const nextIsPreMatra = ['EE','E','O','e','o'].some(s => input.startsWith(s, i));
        if (nextIsCons || nextIsPreMatra) zwnjAfter = true;
      }
    } else {
      vowel = 'a'; // inherent
    }
  }

  // Check for diacritic after vowel (M/H/MM)
  if (!diacritic && i < len) {
    if (input.startsWith('MM', i)) { diacritic = 'ṁ'; i += 2; }
    else if (input[i] === 'M') { diacritic = 'ṃ'; i++; }
    else if (input[i] === 'H') { diacritic = 'ḥ'; i++; }
  }

  // Gemination mark
  let geminated = false;
  if (i < len && input[i] === 'F') { geminated = true; i++; }

  return {
    token: { type: 'syllable', consonants, vowel, diacritic, geminated, zwnjAfter },
    consumed: i - startPos
  };
}

// ============================================================
// RENDER TOKENS -> IAST
// ============================================================

function tokensToIast(tokens) {
  return tokens.map(t => {
    if (t.type === 'space') return t.char;
    if (t.type === 'punct') return t.char;
    if (t.type === 'raw')   return t.char;
    if (t.type === 'vowel') return t.iast === 'ụ' ? 'ụ' : t.iast;
    if (t.type === 'syllable') {
      const { consonants, vowel, diacritic, geminated, zwnjAfter } = t;
      let out = '';
      if (consonants.length === 0) {
        out = vowel || '';
      } else {
        if (geminated && consonants.length > 0) {
          const last = consonants[consonants.length - 1];
          out = consonants.slice(0, -1).join('') + last + last;
        } else {
          out = consonants.join('');
        }
        if (vowel) out += vowel;
      }
      if (diacritic) out += diacritic;
      // Embed ZWNJ into the IAST string so it survives the pivot through
      // parseIastString and reaches iastToScript / iastToTulu intact.
      // parseIastString passes unknown chars through as raw tokens;
      // iastToScript appends raw chars directly; iastToTulu maps ZWNJ -> X.
      if (zwnjAfter && preserveZwnj) out += ZWNJ;
      return out;
    }
    return '';
  }).join('');
}

function tuluToIast(text) {
  // Pure IAST output: never embed ZWNJ regardless of checkbox state.
  // The ZWNJ is only meaningful when routing through to a Unicode script renderer.
  const savedFlag = preserveZwnj;
  preserveZwnj = false;
  const result = tokensToIast(parseMallige(text));
  preserveZwnj = savedFlag;
  return result;
}

// Internal version that respects preserveZwnj, used when pivoting to other scripts.
function tuluToIastPivot(text) {
  return tokensToIast(parseMallige(text));
}

// ============================================================
// IAST PARSER (pivot for other directions)
// ============================================================

function parseIastString(iastInput) {
  // IAST is case-insensitive — normalise to lowercase so that
  // 'Karma' parses the same as 'karma', 'Ś' the same as 'ś', etc.
  const iast = iastInput.toLowerCase();
  // Returns array of tokens: vowel | syllable | raw
  const tokens = [];
  let i = 0;
  const len = iast.length;

  // Ordered consonant list (longer first)
  const IAST_CONS = [
    'kh','gh','ch','jh','ṭh','ḍh','th','dh','ph','bh',
    'ṅ','ñ','ṇ','ṭ','ḍ','ṟ','ḻ','ḷ',
    'k','g','c','j','t','d','n','p','b','m',
    'y','r','l','v','ś','ṣ','s','h','f','z'
  ];

  const IAST_VOWS = [
    'ai','au','ā','ī','ū','r̥','r̥̄','ḹ','l̥','ē','ō','ǣ','æ',
    'aṃ','aḥ','aṁ',
    'ṃ','ḥ','ṁ',
    'a','i','u','e','o','ụ'
  ];

  function tryVowel(pos) {
    for (const v of IAST_VOWS) {
      if (iast.startsWith(v, pos)) return { v, len: v.length };
    }
    return null;
  }

  function tryCons(pos) {
    for (const c of IAST_CONS) {
      if (iast.startsWith(c, pos)) return { c, len: c.length };
    }
    return null;
  }

  while (i < len) {
    const ch = iast[i];
    if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t' || ch === ',' || ch === '।' || ch === '॥') {
      tokens.push({ type: 'raw', char: ch }); i++; continue;
    }

    // Try consonant
    const cm = tryCons(i);
    if (cm) {
      const consonants = [cm.c];
      i += cm.len;
      // Greedily collect all consecutive consonants until a vowel (or end/space).
      // Rule: if the current position has no vowel but has a consonant, that
      // consonant belongs to this cluster. Keep going until we hit a vowel.
      // This correctly handles kṣa (k+ṣ get cluster, a is shared vowel),
      // nta, kṣtra, etc.
      while (true) {
        // If there's a vowel right here, stop — it belongs to the cluster we have
        if (tryVowel(i)) break;
        // If there's a consonant right here, it belongs to this cluster
        const nm = tryCons(i);
        if (!nm) break;
        consonants.push(nm.c);
        i += nm.len;
      }
      // Get vowel — default null means no vowel found (virama needed).
      // Explicit IAST 'a' IS matched by tryVowel, so inherent-a syllables
      // still work correctly; only truly final/cluster consonants get null.
      let vowel = null;
      let diacritic = null;
      const vm = tryVowel(i);
      if (vm) {
        if (vm.v === 'ṃ' || vm.v === 'ḥ' || vm.v === 'ṁ') {
          diacritic = vm.v; i += vm.len;
        } else if (vm.v === 'aṃ' || vm.v === 'aḥ' || vm.v === 'aṁ') {
          // Decompose compound: inherent 'a' + diacritic
          vowel = 'a';
          diacritic = vm.v.slice(1);
          i += vm.len;
        } else {
          vowel = vm.v; i += vm.len;
          // Check diacritic after vowel
          const dm = tryVowel(i);
          if (dm && (dm.v === 'ṃ' || dm.v === 'ḥ' || dm.v === 'ṁ')) {
            diacritic = dm.v; i += dm.len;
          }
        }
      }
      tokens.push({ type: 'syllable', consonants, vowel, diacritic });
      continue;
    }

    // Try standalone vowel or diacritic
    const vm = tryVowel(i);
    if (vm) {
      // Diacritics (anusvara, visarga, anunasika) are not independent vowels —
      // they modify the preceding syllable or vowel. Attach to last token if possible.
      if (vm.v === 'ṃ' || vm.v === 'ḥ' || vm.v === 'ṁ') {
        const last = tokens[tokens.length - 1];
        if (last && last.type === 'syllable' && !last.diacritic) {
          last.diacritic = vm.v;
        } else if (last && last.type === 'vowel') {
          // Append diacritic to the vowel (e.g. 'i' + 'ṃ' → 'iṃ')
          last.iast += vm.v;
        } else {
          // No preceding syllable to attach to — emit as standalone vowel
          // using the 'a' + diacritic compound form (e.g. 'aṃ')
          tokens.push({ type: 'vowel', iast: 'a' + vm.v });
        }
        i += vm.len; continue;
      }
      tokens.push({ type: 'vowel', iast: vm.v }); i += vm.len; continue;
    }

    tokens.push({ type: 'raw', char: ch }); i++;
  }
  return tokens;
}

// ============================================================
// IAST -> TARGET SCRIPT
// ============================================================

function buildScriptMaps(script) {
  // VOWEL_TABLE: [iast, deva_ind, deva_mat, kan_ind, kan_mat, mal_ind, mal_mat]  (7 cols)
  const vsi = { deva: 1, kan: 3, mal: 5 }[script];
  const vmi = { deva: 2, kan: 4, mal: 6 }[script];
  // CONS_TABLE:  [iast, deva, kan, mal]  (4 cols)
  const csi = { deva: 1, kan: 2, mal: 3 }[script];
  const vowInd = {}, vowMat = {}, cons = {};
  for (const row of SCRIPT_VOWEL_TABLE) {
    if (row[vsi]) vowInd[row[0]] = row[vsi];
    if (row[vmi]) vowMat[row[0]] = row[vmi];
  }
  for (const row of SCRIPT_CONS_TABLE) {
    if (row[csi]) cons[row[0]] = row[csi];
  }
  return { vowInd, vowMat, cons, vir: VIRAMA_MAP[script] };
}

function iastToScript(iast, script) {
  const { vowInd, vowMat, cons, vir } = buildScriptMaps(script);
  const tokens = parseIastString(iast);
  let result = '';

  for (const t of tokens) {
    if (t.type === 'raw') { result += t.char; continue; }
    if (t.type === 'vowel') {
      let v = t.iast;
      let d = '';
      if (v.length > 1) {
        const lastChar = v[v.length - 1];
        if (lastChar === 'ṃ' || lastChar === 'ḥ' || lastChar === 'ṁ') {
          if (vowInd[v] !== undefined) {
            result += vowInd[v];
            continue;
          }
          d = lastChar;
          v = v.slice(0, -1);
        }
      }
      result += (vowInd[v] !== undefined ? vowInd[v] : v);
      if (d) {
        const dm = vowMat[d] || vowMat['a' + d];
        result += dm || '';
      }
      continue;
    }
    if (t.type === 'syllable') {
      const { consonants, vowel, diacritic, zwnjAfter } = t;
      for (let ci = 0; ci < consonants.length; ci++) {
        result += (cons[consonants[ci]] || consonants[ci]);
        if (ci < consonants.length - 1) result += vir;
      }
      // Vowel / virama
      if (!vowel || vowel === '') {
        result += vir;
        if (zwnjAfter && preserveZwnj) result += ZWNJ;
      } else if (vowel === 'a') {
        // inherent - nothing
      } else if (vowel === 'ụ') {
        result += vir;
        if (zwnjAfter && preserveZwnj) result += ZWNJ;
      } else {
        result += (vowMat[vowel] !== undefined ? vowMat[vowel] : '');
      }
      if (diacritic) {
        // Try the diacritic as a mātrā key first; if that fails, look up
        // the compound form ('aṃ', 'aḥ', 'aṁ') used in SCRIPT_VOWEL_TABLE.
        const dm = vowMat[diacritic] || vowMat['a' + diacritic];
        if (dm) {
          result += dm;
        } else {
          // Last resort: find the independent-vowel form and strip the base-a
          const compKey = 'a' + diacritic;
          if (vowInd[compKey]) {
            // Independent form is e.g. 'अं'; strip the leading consonant's vowel
            // and keep just the diacritic sign (last char).
            const indForm = vowInd[compKey];
            result += indForm.slice(-1);
          }
        }
      }
    }
  }
  return result;
}

// ============================================================
// IAST -> TULU (Mallige)
// ============================================================

const POST_MAT_FROM_IAST = {
  'ā': 'a', 'i': 'i', 'ī': 'I', 'u': 'u', 'ū': 'U',
  'r̥': 'R', 'r̥̄': 'RR', 'l̥': 'VlX', 'ḹ': 'VllX',
  'ṃ': 'M', 'ḥ': 'H', 'ṁ': 'MM'
};
const PRE_MAT_FROM_IAST = {
  'e': 'e', 'ē': 'E', 'æ': 'o', 'ǣ': 'O', 'ai': 'EE'
};
const SPLIT_MAT_FROM_IAST = {
  'o':  { pre: 'e', post: 'a' },
  'ō':  { pre: 'E', post: 'a' },
  'au': { pre: 'E', post: 'Y' },
};

function iastToTulu(iast) {
  const tokens = parseIastString(iast);
  let result = '';

  for (const t of tokens) {
    if (t.type === 'raw') {
      // ZWNJ passed through from a unicode source -> emit X in Mallige
      result += (t.char === ZWNJ) ? 'X' : t.char;
      continue;
    }
    if (t.type === 'vowel') {
      let v = t.iast;
      let d = '';
      // Separate out the diacritic if the compound isn't explicitly in the map
      if (v.length > 1) {
        const lastChar = v[v.length - 1];
        if (lastChar === 'ṃ' || lastChar === 'ḥ' || lastChar === 'ṁ') {
          if (IAST_TO_MALLIGE_VOW_IND[v]) {
            result += IAST_TO_MALLIGE_VOW_IND[v];
            continue;
          }
          d = lastChar;
          v = v.slice(0, -1);
        }
      }
      result += (IAST_TO_MALLIGE_VOW_IND[v] || v);
      if (d) result += (POST_MAT_FROM_IAST[d] || '');
      continue;
    }
    if (t.type === 'syllable') {
      const { consonants, vowel, diacritic } = t;
      const v = vowel || '';

      let pre = '', post = '';
      if (!v || v === '') {
        // no vowel - will add virama
      } else if (PRE_MAT_FROM_IAST[v]) {
        pre = PRE_MAT_FROM_IAST[v];
      } else if (SPLIT_MAT_FROM_IAST[v]) {
        pre = SPLIT_MAT_FROM_IAST[v].pre;
        post = SPLIT_MAT_FROM_IAST[v].post;
      } else if (POST_MAT_FROM_IAST[v]) {
        post = POST_MAT_FROM_IAST[v];
      }
      // v === 'a' -> inherent, no matra needed

      // Handle repha: if first consonant is r and cluster has more
      let effectiveCons = [...consonants];
      let rephaStr = '';
      if (effectiveCons.length > 1 && effectiveCons[0] === 'r') {
        effectiveCons = effectiveCons.slice(1);
        rephaStr = 'f'; // will be appended after LAST consonant of cluster
      }

      result += pre;

      if (effectiveCons.length === 0) {
        // standalone vowel
        result += (IAST_TO_MALLIGE_VOW_IND[v] || v);
      } else {
        for (let ci = 0; ci < effectiveCons.length; ci++) {
          result += (IAST_TO_MALLIGE_CONS[effectiveCons[ci]] || effectiveCons[ci]);
          if (ci === effectiveCons.length - 1 && rephaStr) result += rephaStr;
          if (ci < effectiveCons.length - 1) result += 'A';
        }

        // Vowel / virama (governed by the SURYAVIRAMA rule)
        if (!v || v === '') {
          const lastC = effectiveCons[effectiveCons.length - 1];
          result += SURYAVIRAMA_CONS.has(lastC) ? 'AX' : 'A';
        } else if (v === 'a') {
          // inherent - nothing
        } else if (v === 'ụ') {
          const lastC = effectiveCons[effectiveCons.length - 1];
          result += SURYAVIRAMA_CONS.has(lastC) ? 'AX' : 'A';
        } else {
          result += post;
        }
      }

      if (diacritic) result += (POST_MAT_FROM_IAST[diacritic] || '');
    }
  }
  return result;
}

// ============================================================
// UNICODE SCRIPT -> IAST -> TULU
// ============================================================

function buildRevMaps(script) {
  // VOWEL_TABLE: [iast, deva_ind, deva_mat, kan_ind, kan_mat, mal_ind, mal_mat]  (7 cols)
  const vsi = { deva: 1, kan: 3, mal: 5 }[script];
  const vmi = { deva: 2, kan: 4, mal: 6 }[script];
  // CONS_TABLE:  [iast, deva, kan, mal]  (4 cols)
  const csi = { deva: 1, kan: 2, mal: 3 }[script];
  const map = {};
  
  for (const row of SCRIPT_VOWEL_TABLE) {
    if (row[vsi] && !map[row[vsi]]) map[row[vsi]] = { type: 'vi', iast: row[0] };
    if (row[vmi] && row[vmi] !== row[vsi] && !map[row[vmi]]) map[row[vmi]] = { type: 'vm', iast: row[0] };
  }
  
  for (const row of SCRIPT_CONS_TABLE) {
    if (row[csi] && !map[row[csi]]) map[row[csi]] = { type: 'c', iast: row[0] };
  }
  
  const vir = VIRAMA_MAP[script];
  if (vir) map[vir] = { type: 'vir' };
  
  // Anusvara, visarga, anunasika for each script
  const extras = {
    deva: { 'ं': 'ṃ', 'ः': 'ḥ', 'ँ': 'ṁ' },
    kan:  { 'ಂ': 'ṃ', 'ಃ': 'ḥ', 'ಁ': 'ṁ' },
    mal:  { 'ം': 'ṃ', 'ഃ': 'ḥ', 'ഁ': 'ṁ' },
  };
  for (const [ch, iast] of Object.entries(extras[script] || {})) {
    // Force-override: these signs were already registered as 'vm' (vowel mātrā)
    // by SCRIPT_VOWEL_TABLE, but they must be 'dia' (diacritic) so that
    // unicodeToIast handles them correctly after consonants AND standalone.
    map[ch] = { type: 'dia', iast };
  }
  
  return { map, vir };
}

function unicodeToIast(text, script) {
  const { map, vir } = buildRevMaps(script);
  let result = '';
  let i = 0;
  const chars = [...text]; // Unicode-aware
  const len = chars.length;

  while (i < len) {
    const ch = chars[i];
    if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') { result += ch; i++; continue; }

    const e = map[ch];
    if (!e) { result += ch; i++; continue; }

    if (e.type === 'vi') {
      // Independent vowel - check it's not actually matra context
      result += e.iast; i++; continue;
    }

    if (e.type === 'c') {
      const iast = e.iast;
      i++;
      // Check next: virama or matra
      if (i < len && chars[i] === vir) {
        // Consonant + virama = no vowel (cluster member or ZWNJ break)
        result += iast;
        i++; // consume virama
        // If virama is followed by ZWNJ, pass it through so iastToTulu emits X
        if (i < len && chars[i] === ZWNJ) { result += ZWNJ; i++; }
      } else if (i < len && map[chars[i]] && map[chars[i]].type === 'vm') {
        const mat = map[chars[i]];
        // Check for diacritic (anusvara/visarga/anunasika) after matra
        let matIast = mat.iast;
        if (i + 1 < len && map[chars[i + 1]] && map[chars[i + 1]].type === 'dia') {
          matIast += map[chars[i + 1]].iast;
          i++; // consume the diacritic too
        }
        result += iast + matIast; i++;
      } else if (i < len && map[chars[i]] && map[chars[i]].type === 'dia') {
        // Consonant + anusvara/visarga/anunasika: emit as cons + inherent-a + diacritic
        result += iast + 'a' + map[chars[i]].iast; i++;
      } else {
        result += iast + 'a'; // inherent vowel
      }
      continue;
    }

    if (e.type === 'dia') {
      result += e.iast; i++; continue;
    }

    result += ch; i++;
  }
  return result;
}

// ============================================================
// ANUSVĀRA → PAÑCAMA-PARASAVARṆA (nasal resolution)
// ============================================================
// Before a stop consonant the anusvāra becomes the class nasal:
//   ka-varga (k kh g gh) → ṅ
//   ca-varga (c ch j jh) → ñ
//   ṭa-varga (ṭ ṭh ḍ ḍh) → ṇ
//   ta-varga (t th d dh) → n
//   pa-varga (p ph b bh) → m
// Before ya, ra, la, va, ḷa and all fricatives it stays ṃ.

const NASAL_FOR_VARGA = {
  'k': 'ṅ', 'kh': 'ṅ', 'g': 'ṅ', 'gh': 'ṅ',
  'c': 'ñ', 'ch': 'ñ', 'j': 'ñ', 'jh': 'ñ',
  'ṭ': 'ṇ', 'ṭh': 'ṇ', 'ḍ': 'ṇ', 'ḍh': 'ṇ',
  't': 'n', 'th': 'n', 'd': 'n', 'dh': 'n',
  'p': 'm', 'ph': 'm', 'b': 'm', 'bh': 'm',
};

// Ordered longest-first so 'kh' is tried before 'k', etc.
const IAST_CONS_ORDERED = [
  'kh','gh','ch','jh','ṭh','ḍh','th','dh','ph','bh',
  'ṅ','ñ','ṇ','ṭ','ḍ','ṟ','ḻ','ḷ',
  'k','g','c','j','t','d','n','p','b','m',
  'y','r','l','v','ś','ṣ','s','h','f','z'
];

function resolveAnusvara(iastStr) {
  // Walk through the IAST string; wherever ṃ appears, peek at the next
  // consonant and replace with the class nasal if applicable.
  let result = '';
  let i = 0;
  const len = iastStr.length;

  while (i < len) {
    if (iastStr[i] === 'ṃ') {
      // Look ahead for the next consonant
      let nextCons = null;
      const rest = i + 1;
      for (const c of IAST_CONS_ORDERED) {
        if (iastStr.startsWith(c, rest)) { nextCons = c; break; }
      }
      if (nextCons && NASAL_FOR_VARGA[nextCons]) {
        result += NASAL_FOR_VARGA[nextCons];
      } else {
        result += 'ṃ';
      }
      i++;
    } else {
      result += iastStr[i];
      i++;
    }
  }
  return result;
}

let resolveNasals = true; // default ON; UI checkbox disables it

// ============================================================
// MAIN CONVERT FUNCTION
// ============================================================

let preserveZwnj = false; // controlled by UI checkbox
const ZWNJ = '\u200C';

function convert(text, dir) {
  if (!text || !text.trim()) return '';
  try {
    switch (dir) {
      case 'tulu-iast': return tuluToIast(text);       // clean IAST, no ZWNJ
      case 'iast-tulu': return iastToTulu(text);
      case 'tulu-deva': return iastToScript(tuluToIastPivot(text), 'deva');
      case 'deva-tulu': {
        let iast = unicodeToIast(text, 'deva');
        if (resolveNasals) iast = resolveAnusvara(iast);
        return iastToTulu(iast);
      }
      case 'tulu-kan':  return iastToScript(tuluToIastPivot(text), 'kan');
      case 'kan-tulu': {
        let iast = unicodeToIast(text, 'kan');
        if (resolveNasals) iast = resolveAnusvara(iast);
        return iastToTulu(iast);
      }
      case 'tulu-mal':  return iastToScript(tuluToIastPivot(text), 'mal');
      case 'mal-tulu': {
        let iast = unicodeToIast(text, 'mal');
        if (resolveNasals) iast = resolveAnusvara(iast);
        return iastToTulu(iast);
      }
      default: return text;
    }
  } catch(e) {
    return '[Error: ' + e.message + ']';
  }
}