import { apiRequest } from './apiRequests.js';
import { logMessage } from './logger.js';

// ─── In-Memory Cache ─────────────────────────────────
const cache     = new Map();  // key → { response, expiresAt }
const inFlight  = new Map();  // key → Promise  (deduplicates concurrent requests)

// · Key
function getCacheKey(apiKey, options = {}) {
    return JSON.stringify({ apiKey, options });
}

// · TTL check
function isExpired(entry) {
    return entry.expiresAt !== null && Date.now() > entry.expiresAt;
}

// ─── Clear ───────────────────────────────────────────
// Pass apiKey + options to clear a specific entry, or nothing to clear all.
export function clearCache(apiKey, options = {}) {
    if (!apiKey) { cache.clear(); return; }
    cache.delete(getCacheKey(apiKey, options));
}

// ─── Request ─────────────────────────────────────────
// Options:
//   cache  {boolean} — store the response (default: true)
//   fresh  {boolean} — bypass reading from cache (default: false)
//   ttl    {number|null} — ms until auto-expiry (default: null = never)
export async function cachedApiRequest(apiKey, options = {}) {
    const { cache: shouldCache = true, fresh = false, ttl = null, ...requestOptions } = options;
    const key = getCacheKey(apiKey, requestOptions);

    // · Read from cache unless fresh or expired
    if (!fresh && cache.has(key)) {
        const entry = cache.get(key);
        if (!isExpired(entry)) {
            logMessage(`[cache] hit: ${apiKey}`, undefined, 'green');
            return entry.response;
        }
        cache.delete(key);  // expired — remove and re-fetch
        logMessage(`[cache] expired: ${apiKey}`, undefined, 'grey');
    }

    // · Deduplicate concurrent requests for the same key
    if (inFlight.has(key)) {
        logMessage(`[cache] in-flight hit: ${apiKey}`, undefined, 'blue');
        return inFlight.get(key);
    }

    const promise = apiRequest(apiKey, requestOptions).then(response => {
        inFlight.delete(key);
        if (shouldCache) {
            cache.set(key, {
                response,
                expiresAt: ttl !== null ? Date.now() + ttl : null,
            });
            logMessage(`[cache] stored: ${apiKey}`, undefined, 'yellow');
        }
        return response;
    }).catch(err => {
        inFlight.delete(key);
        throw err;
    });

    inFlight.set(key, promise);
    return promise;
}
