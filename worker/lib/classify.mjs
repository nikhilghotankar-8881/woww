// worker/lib/classify.mjs

const DATE = /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+\d{4})\b/i;
const MONEY = /(₹|rs\.?|inr)\s?[\d,]+(\.\d+)?/i;
const KEYWORDS_EN = /(last date|cut-?off|deadline|extended|extension|eligib|exclu|mandatory|e-?kyc|farmer id|instal?lment|withheld|revised|corrigendum|notified|premium|subsid)/i;
const KEYWORDS_MR = /(शेवटची तारीख|अंतिम दिनांक|मुदतवाढ|पात्र|अपात्र|हप्ता|ई-केवायसी|शेतकरी ओळख|प्रीमियम|अनुदान)/;
const KEYWORDS_HI = /(अंतिम तिथि|समय सीमा|पात्र|अपात्र|किस्त|ई-केवाईसी|प्रीमियम|सब्सिडी|संशोधित)/;

/**
 * Checks whether a single text line contains material changes:
 * dates, money amounts, eligibility/exclusion criteria, or official deadlines.
 */
export function isMaterialLine(line = '') {
  if (!line || typeof line !== 'string') return false;
  return DATE.test(line) ||
    MONEY.test(line) ||
    KEYWORDS_EN.test(line) ||
    KEYWORDS_MR.test(line) ||
    KEYWORDS_HI.test(line);
}

/**
 * Classifies a set of diff entries into 'material' or 'cosmetic'.
 * Only checks 'add' entries (what newly appeared).
 */
export function classify(diff = []) {
  if (!diff || !Array.isArray(diff) || diff.length === 0) {
    return 'cosmetic';
  }

  const hasMaterialAdd = diff.some(d => d.type === 'add' && isMaterialLine(d.line));
  return hasMaterialAdd ? 'material' : 'cosmetic';
}

