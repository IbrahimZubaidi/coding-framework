// ─── Environment ─────────────────────────────────────
import { isDevelopment } from '../services/logger.js';
export function isDev() { return isDevelopment; }

// ─── Time ────────────────────────────────────────────
// Returns a compact relative time label for any valid date string.
export function formatRelativeTime(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    const diffInSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
}

// ─── Greeting ────────────────────────────────────────
// Returns 'morning', 'afternoon', or 'evening' based on current hour.
export function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

// ─── Page ────────────────────────────────────────────
// Returns the current page file name from the browser path.
export function getCurrentPage() {
    return window.location.pathname.split('/').pop();
}

// ─── Navigation ──────────────────────────────────────
// Navigates to a page with optional query params.
// Omits keys with empty/null/undefined values.
//
//   navigateTo('courses.html', { search: 'biology', category: 'medicine' })
export function navigateTo(page, params = {}) {
    const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString();
    window.location.href = qs ? `${page}?${qs}` : page;
}

// Pushes filter params to the browser URL without a page reload.
// Omits keys with null/empty values; resets to bare path if all empty.
//
//   pushFiltersToUrl({ search: 'bio', page: 2 })
export function pushFiltersToUrl(params = {}) {
    const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString();
    history.pushState({}, '', qs ? `?${qs}` : window.location.pathname);
}

// Binds a search field + button to navigate to a page on submit.
// Clears the param key (bare page URL) when the field is empty.
//
//   bindSearchNav({
//       field : document.querySelector('.search-input__field'),
//       btn   : document.querySelector('.search-input__btn'),
//       page  : 'courses.html',
//       key   : 'search',   // default
//   })
export function bindSearchNav({ field, btn, page, key = 'search' }) {
    const go = () => {
        const q = field?.value?.trim();
        navigateTo(page, q ? { [key]: q } : {});
    };
    btn?.addEventListener('click', go);
    field?.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
}
