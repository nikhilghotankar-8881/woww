// worker/lib/diff.mjs
import * as Diff from 'diff';

/**
 * Computes line-by-line differences between two normalized text strings.
 * Returns an array of changes: [{ type: 'add' | 'del', line: string }]
 */
export function computeDiff(oldText = '', newText = '') {
  if (oldText === newText) {
    return [];
  }

  const changes = Diff.diffLines(oldText, newText);
  const result = [];

  for (const part of changes) {
    if (part.added || part.removed) {
      const type = part.added ? 'add' : 'del';
      const lines = part.value
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(Boolean);

      for (const line of lines) {
        result.push({ type, line });
      }
    }
  }

  return result;
}

