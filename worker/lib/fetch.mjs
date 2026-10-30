// worker/lib/fetch.mjs
import { canonicalUrl } from './normalize.mjs';

const USER_AGENT = 'ShetkariSuchnaSetu/0.1 (Official Notice Monitor Prototype; contact: info@shetkarisuchna.org)';
const TIMEOUT_MS = 20000;

/**
 * Polite HTTP fetch helper with:
 * - Informative User-Agent
 * - Timeout handling (20s)
 * - Retries with exponential backoff
 * - Conditional GET support (ETag / If-Modified-Since)
 */
export async function politeFetch(targetUrl, options = {}) {
  const {
    etag = null,
    lastModified = null,
    retries = 2,
    backoffMs = 1500
  } = options;

  const cleanUrl = canonicalUrl(targetUrl);
  const headers = {
    'User-Agent': USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.8,*/*;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9,mr;q=0.8,hi;q=0.7'
  };

  if (etag) headers['If-None-Match'] = etag;
  if (lastModified) headers['If-Modified-Since'] = lastModified;

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(cleanUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      if (response.status === 304) {
        return {
          status: 304,
          notModified: true,
          durationMs,
          etag,
          lastModified
        };
      }

      const contentType = response.headers.get('content-type') || '';
      const responseEtag = response.headers.get('etag');
      const responseLastMod = response.headers.get('last-modified');

      let bodyText = '';
      let bytes = 0;

      if (contentType.includes('application/pdf')) {
        const buffer = await response.arrayBuffer();
        bytes = buffer.byteLength;
        bodyText = Buffer.from(buffer).toString('base64'); // Stored as base64 for pdf handling
      } else {
        bodyText = await response.text();
        bytes = Buffer.byteLength(bodyText, 'utf8');
      }

      return {
        status: response.status,
        notModified: false,
        durationMs,
        bytes,
        body: bodyText,
        contentType,
        etag: responseEtag,
        lastModified: responseLastMod,
        ok: response.ok
      };
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt <= retries) {
        await new Promise(r => setTimeout(r, backoffMs * attempt));
      }
    }
  }

  return {
    status: 0,
    ok: false,
    error: lastError?.message || 'Network fetch timeout or failure',
    durationMs: TIMEOUT_MS
  };
}

