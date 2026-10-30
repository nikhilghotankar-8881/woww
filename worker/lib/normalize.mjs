// worker/lib/normalize.mjs
import * as cheerio from 'cheerio';

/**
 * Strips ASP.NET session tokens and unwanted query parameters from URLs
 */
export function canonicalUrl(url) {
  if (!url) return '';
  return url.replace(/\/\(S\([^)]*\)\)/i, '');
}

/**
 * Normalizes HTML content into stable, comparable text lines.
 * Strips scripts, styles, navigation, footer, and applies CSS selector if provided.
 * Filters out lines matching ignorePatterns (e.g. counters, dynamic timestamps).
 */
export function normalize(html, options = {}) {
  const { selector = null, ignorePatterns = [] } = options;
  if (!html || typeof html !== 'string') return '';

  const $ = cheerio.load(html);

  // Strip transient or structural elements
  $('script, style, noscript, nav, footer, header, iframe, svg').remove();

  const root = selector && $(selector).length > 0 ? $(selector) : $('body');

  const rawText = root.text();

  const lines = rawText
    .replace(/\u00a0/g, ' ') // Non-breaking spaces to standard spaces
    .split(/\r?\n+/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 0)
    .filter(line => {
      return !ignorePatterns.some(pattern => {
        try {
          return new RegExp(pattern, 'i').test(line);
        } catch {
          return false;
        }
      });
    });

  return lines.join('\n');
}

