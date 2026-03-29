// src/utils/apiUtils.js  — Free APIs, no key required (or free public keys)

const LANG_CODE = {
  'auto-detect':'auto','english':'en','spanish':'es','french':'fr','german':'de',
  'italian':'it','portuguese':'pt','russian':'ru','chinese':'zh','japanese':'ja',
  'korean':'ko','arabic':'ar','hindi':'hi','turkish':'tr','polish':'pl',
  'dutch':'nl','greek':'el','english (uk)':'en','english (us)':'en',
};
function toLangCode(lang) {
  if (!lang) return 'en';
  return LANG_CODE[lang.toLowerCase()] || lang.slice(0,2).toLowerCase();
}

// ── Google Translate (unofficial endpoint — same one Python `googletrans` uses) ─
// No API key required. Up to ~5000 chars per call. Works in browser via CORS.
export async function translateText(text, sourceLang = 'en', targetLang = 'es') {
  if (!text?.trim()) return '';
  const trimmed = text.slice(0, 5000);
  const src = toLangCode(sourceLang); // 'auto' for auto-detect
  const tgt = toLangCode(targetLang);
  if (src === tgt && src !== 'auto') return trimmed;

  try {
    // Same URL the Python googletrans library hits
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=${src}&tl=${tgt}&dt=t` +
      `&q=${encodeURIComponent(trimmed)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);
    const data = await res.json();

    // data[0] = array of [translatedChunk, originalChunk, ...]
    const translated = (data[0] || [])
      .map(chunk => chunk?.[0] || '')
      .join('');

    if (!translated.trim()) throw new Error('Empty response from Google');
    return translated;
  } catch (err) {
    console.warn('Google Translate failed:', err.message, '— trying MyMemory fallback');
    return translateFallback(trimmed, src, tgt);
  }
}

// ── Fallback: MyMemory (free, 500 chars/call, no key) ────────────────────────
async function translateFallback(text, src, tgt) {
  try {
    const langPair = src === 'auto' ? `en|${tgt}` : `${src}|${tgt}`;
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${langPair}`
    );
    if (!res.ok) throw new Error('MyMemory HTTP ' + res.status);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText)
      return data.responseData.translatedText;
    throw new Error(data.responseDetails || 'No result');
  } catch (err2) {
    console.error('MyMemory fallback also failed:', err2.message);
    return `[Translation unavailable — check your connection]`;
  }
}

export async function cachedTranslate(text, srcLang, tgtLang) {
  const key = `tc_${toLangCode(srcLang)}_${toLangCode(tgtLang)}_${text.slice(0,30)}`;
  try { const c = localStorage.getItem(key); if (c) return JSON.parse(c); } catch {}
  const result = await translateText(text, srcLang, tgtLang);
  try { localStorage.setItem(key, JSON.stringify(result)); } catch {}
  return result;
}

// LanguageTool: free, 20k chars/request, no key needed
const CAT_MAP = {
  GRAMMAR:'Grammar Correction', TYPOS:'Grammar Correction', SPELLING:'Grammar Correction',
  STYLE:'Precision Enhancement', REDUNDANCY:'Precision Enhancement', PUNCTUATION:'Precision Enhancement',
  COLLOCATIONS:'Terminology Sync', MISC:'Terminology Sync', CONFUSED_WORDS:'Grammar Correction',
};

export async function checkGrammar(text, language='en-US') {
  if (!text?.trim()) return { matches:[], success:false };
  try {
    const res = await fetch('https://api.languagetool.org/v2/check', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:`text=${encodeURIComponent(text.slice(0,20000))}&language=${language}`,
    });
    if (!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    const matches = data.matches.map(m => ({
      type: CAT_MAP[m.rule?.category?.id] || 'Grammar Correction',
      issue: m.message,
      hint: m.shortMessage || m.rule?.description || '',
      replacement: m.replacements?.[0]?.value || null,
      offset: m.offset, length: m.length,
      context: m.context?.text || '',
    }));
    return { matches, success:true };
  } catch(err) {
    console.error('Grammar error:', err);
    return { matches:[], success:false, error:err.message };
  }
}

// ── OCR — Tesseract.js npm package (in-browser, no API key, no limits) ────────
// Run:  npm install tesseract.js   in the project folder first.
// Falls back to OCR.space if Tesseract isn't installed yet.
export async function extractTextFromImage(file) {
  if (!file) return { text: '', success: false };
  try {
    // Try npm-installed Tesseract.js first
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const imageUrl = URL.createObjectURL(file);
    const { data } = await worker.recognize(imageUrl);
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
    const text = (data.text || '').trim();
    if (!text) return { text: '', success: false, error: 'No text detected. Try a clearer image.' };
    return { text, success: true };
  } catch (tesseractErr) {
    console.warn('Tesseract.js not available, trying OCR.space:', tesseractErr.message);
    return extractOCRSpace(file);
  }
}

async function extractOCRSpace(file) {
  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('language', 'eng');
    fd.append('isOverlayRequired', 'false');
    fd.append('apikey', 'helloworld'); // OCR.space free demo key
    fd.append('OCREngine', '2');
    const res = await fetch('https://api.ocr.space/parse/image', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage?.[0] || 'OCR failed');
    const text = (data.ParsedResults?.[0]?.ParsedText || '').trim();
    if (!text) throw new Error('No text found in image');
    return { text, success: true };
  } catch (err) {
    console.error('OCR.space error:', err);
    return { text: '', success: false, error: 'OCR failed. Install Tesseract: npm install tesseract.js' };
  }
}

export async function detectLanguage(text) {
  if (!text || text.length < 5) return { language:'Unknown', confidence:0 };
  try {
    const res = await fetch('https://api.languagetool.org/v2/check', {
      method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:`text=${encodeURIComponent(text.slice(0,200))}&language=auto`,
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return { language: data.language?.detectedLanguage?.name || 'Unknown', confidence: 0.9 };
  } catch { return { language:'Unknown', confidence:0 }; }
}

export async function batchTranslate(texts, srcLang, tgtLang) {
  return Promise.all(texts.map(t => translateText(t, srcLang, tgtLang)));
}

export function getSupportedLanguages() {
  return ['English','Spanish','French','German','Italian','Portuguese','Russian',
    'Chinese','Japanese','Korean','Arabic','Hindi','Turkish','Polish','Dutch','Greek'];
}
