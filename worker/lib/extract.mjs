// worker/lib/extract.mjs
import { GoogleGenerativeAI } from '@google/generative-ai';

const DATE_REGEX = /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+\d{4})\b/i;
const MONEY_REGEX = /(₹|rs\.?|inr)\s?[\d,]+(\.\d+)?/i;
const PERCENT_REGEX = /\b\d+(\.\d+)?\s*%/;

/**
 * Deterministic regex-first extraction from added lines
 */
export function extractFieldsWithRegex(addedLines = []) {
  const fields = [];

  for (const line of addedLines) {
    // Check for dates
    const dateMatch = line.match(DATE_REGEX);
    if (dateMatch) {
      const isDeadline = /(last date|deadline|cut-?off|शेवटची तारीख|अंतिम)/i.test(line);
      const isInstalment = /(instal?lment|हप्ता|किस्त|released)/i.test(line);

      fields.push({
        name: isDeadline ? 'last_date' : (isInstalment ? 'instalment_date' : 'date'),
        value: dateMatch[0],
        evidence: line,
        method: 'regex'
      });
    }

    // Check for money amounts
    const moneyMatch = line.match(MONEY_REGEX);
    if (moneyMatch) {
      fields.push({
        name: 'amount',
        value: moneyMatch[0],
        evidence: line,
        method: 'regex'
      });
    }

    // Check for premium percentages
    const pctMatch = line.match(PERCENT_REGEX);
    if (pctMatch && /(premium|शेतकरी हिस्सा|विमा)/i.test(line)) {
      fields.push({
        name: 'premium',
        value: pctMatch[0],
        evidence: line,
        method: 'regex'
      });
    }

    // Check for mandatory requirements
    if (/(mandatory|अनिवार्य|बंधनकारक|e-?kyc|आधार)/i.test(line)) {
      fields.push({
        name: 'requirement',
        value: line.slice(0, 60),
        evidence: line,
        method: 'regex'
      });
    }
  }

  return fields;
}

/**
 * Optional Gemini LLM extractor (only runs on worker side, never on client)
 */
export async function extractFieldsWithGemini(addedLines = [], contextText = '', apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey || addedLines.length === 0) {
    return extractFieldsWithRegex(addedLines);
  }

  const prompt = `You extract factual updates from an official Indian government agriculture notice.
CRITICAL RULES:
1. Use ONLY the text below.
2. Return a JSON object with a single "fields" array: {"fields":[{"name": field_name, "value": string, "evidence": verbatim_exact_string_from_text}]}.
3. "name" must be one of: [last_date, instalment_date, amount, requirement, premium, scheme_name].
4. "value" and "evidence" must be copied EXACTLY verbatim from the provided TEXT without paraphrasing or translating.
5. If no facts match, return {"fields":[]}.

TEXT:
${addedLines.join('\n')}

ADDITIONAL CONTEXT:
${contextText.slice(0, 500)}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json'
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    if (parsed && Array.isArray(parsed.fields)) {
      return parsed.fields.map(f => ({
        ...f,
        method: 'llm'
      }));
    }
  } catch (err) {
    console.warn('[Extractor] Gemini extraction failed or timed out, falling back to regex:', err.message);
  }

  return extractFieldsWithRegex(addedLines);
}

/**
 * Unified extract function: combines regex extraction and optional Gemini extraction.
 */
export async function extractFields(addedLines = [], fullText = '', options = {}) {
  const { useLLM = false, apiKey = process.env.GEMINI_API_KEY } = options;

  if (useLLM && apiKey) {
    return await extractFieldsWithGemini(addedLines, fullText, apiKey);
  }

  return extractFieldsWithRegex(addedLines);
}

