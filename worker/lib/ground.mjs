// worker/lib/ground.mjs

const normalizeForGrounding = (str = '') =>
  str
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/**
 * Validates that extracted fields are fully grounded in the actual source text.
 * Rule 1: The verbatim evidence string must exist inside the source text.
 * Rule 2: The extracted value string must exist inside the evidence string.
 */
export function ground(fields = [], sourceText = '') {
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    return { status: 'grounded', notes: [] };
  }

  const cleanSource = normalizeForGrounding(sourceText);
  const notes = [];

  for (const field of fields) {
    const fieldName = field.name || 'unnamed';
    const evidence = normalizeForGrounding(field.evidence || '');
    const val = normalizeForGrounding(field.value || '');

    if (!evidence) {
      notes.push(`Missing evidence for field: ${fieldName}`);
      continue;
    }

    if (!cleanSource.includes(evidence)) {
      notes.push(`Evidence not found in source text: "${field.evidence}" (${fieldName})`);
    } else if (val && !evidence.includes(val)) {
      notes.push(`Value "${field.value}" not found inside evidence for field: ${fieldName}`);
    }
  }

  return {
    status: notes.length === 0 ? 'grounded' : 'ungrounded',
    notes
  };
}

