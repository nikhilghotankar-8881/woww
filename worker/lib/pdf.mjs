// worker/lib/pdf.mjs
import pdf from 'pdf-parse';

/**
 * Extracts plain text from a PDF Buffer or base64 string.
 * If text cannot be extracted (e.g. scanned image or legacy Marathi font encoding),
 * returns empty string and flag indicating manual review is needed.
 */
export async function extractPdfText(pdfData) {
  try {
    const buffer = Buffer.isBuffer(pdfData)
      ? pdfData
      : Buffer.from(pdfData, 'base64');

    const data = await pdf(buffer);
    const text = data.text ? data.text.trim() : '';

    // Check if extracted text appears to be corrupted or empty
    const isExtractable = text.length > 50;

    return {
      text,
      isExtractable,
      numpages: data.numpages || 1
    };
  } catch (err) {
    console.warn('[PDF] Extraction failed:', err.message);
    return {
      text: '',
      isExtractable: false,
      error: err.message
    };
  }
}

