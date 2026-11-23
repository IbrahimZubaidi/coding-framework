import { logError } from '../services/logger.js';
import { cachedApiRequest } from '../services/cache.js';
import { showUserMessage } from '../components/atoms/message.js';
import { getCurrentLocale } from '../services/i18n.js';

// ─── Fetch Request Data ───────────────────────────────
// Accepts a request config object directly — no class required.
// Mutates request.responseData in-place with the API response.
//
// Config options:
//   apiKey      {string}       — required
//   params      {object}       — URL params e.g. { course_id: 5 }
//   requestData {object}       — query/body data
//   cache       {boolean}      — store response (default: true)
//   fresh       {boolean}      — bypass cache (default: false)
//   ttl         {number|null}  — auto-expiry in ms (default: null)
export async function fetchRequestData(request) {
    if (!request?.apiKey) {
        logError('fetchRequestData: missing apiKey', request);
        return;
    }
    try {
        const data = request.requestData;
        const resolvedData = data?.lang === true ? { ...data, lang: getCurrentLocale() } : data;

        const options = { data: resolvedData };
        if (request.params != null) options.params = request.params;
        if (request.cache  != null) options.cache  = request.cache;
        if (request.fresh  != null) options.fresh  = request.fresh;
        if (request.ttl    != null) options.ttl    = request.ttl;

        const response = await cachedApiRequest(request.apiKey, options);
        request.responseData   = response.data;
        request.responseStatus = response.status ?? null;
        request.responseOk     = response.ok     ?? true;
    } catch (error) {
        logError('fetchRequestData failed', error);
        showUserMessage({});
    }
}
