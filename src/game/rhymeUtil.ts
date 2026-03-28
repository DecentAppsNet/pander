// Simple suffix-based rhyme detection for game use.
// Not phonetically perfect, but good enough for gameplay.

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

// Words where "ea" is pronounced /eɪ/ instead of /iː/.
const _IRREGULAR_EA:Record<string, string> = {
  'great': 'grate', 'break': 'brake', 'steak': 'stake',
};

// Find the rhyme nucleus: from the last stressed vowel cluster onward.
// e.g. "street" → "eet", "money" → "oney", "gat" → "at", "side" → "ide"
function _rhymeSuffix(word:string):string {
  // Collapse doubled-consonant+"ed" past tenses (e.g. "charred"→"chard", "grilled"→"grild")
  const w = (_IRREGULAR_EA[word.toLowerCase()] ?? word.toLowerCase()).replace(/([^aeiou])\1ed$/, '$1d');
  // Strip trailing silent 'e' for words like "side", "make", "pride"
  // but not for words where 'e' is the actual vowel sound (e.g. "be", "me")
  const stripped = (w.length >= 3 && w.endsWith('e') && !VOWELS.has(w[w.length - 2]))
    ? w.slice(0, -1) : w;
  // Walk backwards to find the last vowel-consonant boundary
  let lastVowelStart = -1;
  for (let i = stripped.length - 1; i >= 0; i--) {
    // 'y' at position 0 acts as a consonant (e.g. "yard"), not a vowel
    const isVowel = i === 0 ? (stripped[i] !== 'y' && VOWELS.has(stripped[i])) : VOWELS.has(stripped[i]);
    if (isVowel) {
      lastVowelStart = i;
    } else if (lastVowelStart !== -1) {
      break;
    }
  }
  if (lastVowelStart === -1) return stripped.slice(-2); // fallback for no-vowel words
  // Re-append the 'e' if we stripped it, so suffixes include it for normalization
  return stripped.slice(lastVowelStart) + (stripped !== w ? 'e' : '');
}

// Normalize common spelling variations that sound the same.
// Longer patterns must come before shorter ones to avoid partial matches.
function _normalizeSuffix(suffix:string):string {
  return suffix
    // Long-A (/eɪ/) — rain, sane, reign, vein, weight, hate, game, claim
    .replace(/eight$/, 'ait')
    .replace(/eign$/, 'ain')
    .replace(/ein$/, 'ain')
    .replace(/ane$/, 'ain')
    .replace(/ade$/, 'aid')
    .replace(/ate$/, 'ait')
    .replace(/ame$/, 'aim')
    .replace(/aze$/, 'ais')
    .replace(/ays$/, 'ais')
    .replace(/ake$/, 'aik')
    .replace(/ale$/, 'ail')
    .replace(/ave$/, 'aiv')
    // Long-E (/iː/) — beat, real, mean, dream, green, seen, feel
    .replace(/eart$/, 'art')
    .replace(/ea([a-z]*)$/, 'ee$1')
    .replace(/ey$/, 'ee')
    .replace(/ene$/, 'een')
    // Long-I (/aɪ/) — fight, high, sign, wise, size, fly, die
    .replace(/ight$/, 'ite')
    .replace(/igh$/, 'eye')
    .replace(/ign$/, 'ine')
    .replace(/ise$/, 'ice')
    .replace(/ize$/, 'ice')
    .replace(/yme$/, 'ime')
    .replace(/^y$/, 'eye')
    .replace(/([^e])y$/, '$1eye')
    .replace(/ie$/, 'eye')
    // Long-O (/oʊ/) — broke, oak, groan, bone
    .replace(/ough$/, 'o')
    .replace(/ow$/, 'o')
    .replace(/oak$/, 'oke')
    .replace(/oan$/, 'one')
    // Silent-b normalizations (longer patterns first)
    .replace(/imb$/, 'ime')
    .replace(/mb$/, 'm')
    // Consonant normalizations
    .replace(/ph$/, 'f')
    .replace(/ck$/, 'k')
    // OO/ew/ou sounds (/uː/) — you, true, crew, too, blue
    .replace(/ool$/, 'uel')
    .replace(/oo$/, 'ue')
    .replace(/ou$/, 'ue')
    .replace(/ew$/, 'ue')
    // Collapse trailing double consonants (grill→gril, buzz→buz)
    .replace(/([^aeiou])\1$/, '$1');
}

export function doesRhyme(word:string, target:string):boolean {
  const w = word.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (w === t) return false; // same word doesn't count
  if (w.length < 2 || t.length < 2) return false;

  const wSuffix = _normalizeSuffix(_rhymeSuffix(w));
  const tSuffix = _normalizeSuffix(_rhymeSuffix(t));
  const rhymes = wSuffix === tSuffix;
  if (rhymes) {
    console.log(`[rhyme] "${w}" rhymes with "${t}" (suffix: "${wSuffix}")`);
  }
  return rhymes;
}
