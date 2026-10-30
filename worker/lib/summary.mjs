// worker/lib/summary.mjs
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Deterministic template summary (default).
 * Guaranteed to be grounded because it quotes verbatim evidence.
 */
export function generateTemplateSummary(params = {}) {
  const {
    schemeName = 'Notice Update',
    sourceName = 'Official Portal',
    evidence = '',
    checkedAt = new Date()
  } = params;

  const timeStr = new Date(checkedAt).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit'
  });

  const quote = evidence ? ` "${evidence.slice(0, 140)}"` : '';
  const text = `${schemeName}: Official notice on ${sourceName} updated:${quote} (checked ${timeStr} IST).`;
  return text.slice(0, 240);
}

/**
 * Optional Gemini LLM summary generator with strict safety check:
 * Every number, date, or amount in the generated summary MUST appear in the evidence text.
 * Otherwise, falls back to template summary.
 */
export async function generateSummary(params = {}, options = {}) {
  const {
    schemeName = 'Notice Update',
    sourceName = 'Official Portal',
    evidence = '',
    checkedAt = new Date()
  } = params;

  const { useLLM = false, apiKey = process.env.GEMINI_API_KEY } = options;

  if (!useLLM || !apiKey || !evidence) {
    return {
      summary: generateTemplateSummary(params),
      method: 'template'
    };
  }

  const prompt = `Write a factual, neutral 1-sentence summary (max 200 characters) for a farmer explaining this official government notice update.
Scheme: ${schemeName}
Source: ${sourceName}
Notice text: "${evidence}"
RULES:
1. Do NOT invent dates, numbers, or promises.
2. Every number and date mentioned in your sentence must be present in the notice text.
3. Keep it under 200 characters.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 100 }
    });

    const result = await model.generateContent(prompt);
    const candidate = result.response.text().trim();

    // Verify all digits/numbers in candidate appear in evidence
    const numbersInCandidate = candidate.match(/\d+/g) || [];
    const allNumbersPresent = numbersInCandidate.every(num => evidence.includes(num));

    if (allNumbersPresent && candidate.length > 10 && candidate.length <= 240) {
      return { summary: candidate, method: 'llm' };
    }
  } catch (err) {
    console.warn('[Summary] Gemini summary generation failed, using template:', err.message);
  }

  return {
    summary: generateTemplateSummary(params),
    method: 'template'
  };
}

