// ─── Global icon map ─────────────────────────────────
// Most icons use a 24×24 viewBox. Exceptions store [inner, viewBox] as a tuple.
//
// Usage:
//   import { getIcon } from './icons.js';
//   getIcon('book', 20)   // step cards
//   getIcon('book', 13)   // badge icons

const ICONS = {
    lightning : `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    heart     : `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
    book      : `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
    message   : `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    play      : `<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>`,
    chart        : `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
    'check-circle': `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
    'check'       : `<polyline points="20 6 9 17 4 12"/>`,
    award          : `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`,
    globe          : `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
    shield         : `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    tag            : `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`,
    phone          : `<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
    mail           : `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`,
    users          : `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    target         : `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
    lightbulb      : `<path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6H8.3C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z"/>`,
    'phone-call'   : `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z"/>`,
    'map-pin'      : `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
    subject        : `<g transform="translate(4 4) scale(1.3333333)"><path d="M7.5 1H3C2.73478 1 2.48043 1.10536 2.29289 1.29289C2.10536 1.48043 2 1.73478 2 2V10C2 10.2652 2.10536 10.5196 2.29289 10.7071C2.48043 10.8946 2.73478 11 3 11H9C9.26522 11 9.51957 10.8946 9.70711 10.7071C9.89464 10.5196 10 10.2652 10 10V3.5L7.5 1Z" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.25 4.5H7.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.25 6.5H7.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.25 8.5H6.75" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    question       : `<g transform="translate(4 4) scale(1.3333333)"><path d="M6 8.5H6.005" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 1H3C2.73478 1 2.48043 1.10536 2.29289 1.29289C2.10536 1.48043 2 1.73478 2 2V10C2 10.2652 2.10536 10.5196 2.29289 10.7071C2.48043 10.8946 2.73478 11 3 11H9C9.26522 11 9.51957 10.8946 9.70711 10.7071C9.89464 10.5196 10 10.2652 10 10V3.5L7.5 1Z" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5498 4.49996C4.66979 4.16928 4.90219 3.89128 5.20637 3.71458C5.51055 3.53787 5.86716 3.47369 6.21386 3.53326C6.56056 3.59283 6.8753 3.77236 7.10305 4.04047C7.3308 4.30857 7.45708 4.64819 7.4598 4.99996C7.4598 5.99996 5.9598 6.49996 5.9598 6.49996" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    clock          : [`<g clip-path="url(#clip0_1_12281)"><path d="M7.5 13.75C10.9518 13.75 13.75 10.9518 13.75 7.5C13.75 4.04822 10.9518 1.25 7.5 1.25C4.04822 1.25 1.25 4.04822 1.25 7.5C1.25 10.9518 4.04822 13.75 7.5 13.75Z" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 3.75V7.5L10 8.75" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_1_12281"><rect width="15" height="15" fill="white"/></clipPath></defs>`, '0 0 15 15'],
    'play-circle'  : [`<path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 6L12 9L7.5 12V6Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`, '0 0 18 18'],
    'credit-card'  : `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>`,
    'sparkle'      : `<path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 3.3 2.4-7.4L2 9.4h7.6z"/>`,
    'zap'          : `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    'lock-open'    : `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>`,
    'chevron-up'   : `<polyline points="18 15 12 9 6 15"/>`,
    'chevron-down' : `<polyline points="6 9 12 15 18 9"/>`,
    'clipboard'    :`<rect x="9" y="2" width="6" height="4" rx="1" ry="1"/><path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>`,
    'eye'          : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
    'arrow-right'  : `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
};

// ─── getIcon ─────────────────────────────────────────
// Returns a scaled SVG string for the given icon key.
// size  number  — rendered width & height in px (viewBox stays 24×24)
export function getIcon(key, size = 20) {
    if (!key) return '';
    const entry = ICONS[key];
    if (!entry) {
        console.warn(`[icons] unknown icon key: "${key}"`);
        return '';
    }
    const [inner, viewBox] = Array.isArray(entry) ? entry : [entry, '0 0 24 24'];
    return `<svg width="${size}" height="${size}" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

// ─── Brand ───────────────────────────────────────────
// Text logo: "IMF AutoML" in a single modern typeface
// variant: 'default' → dark text (on light bg)
//          'dark'    → white text (on dark/navy bg)
//          (omit)    → both wrapped in .app-logo-wrap (CSS switches via [data-theme])

export function renderAppLogo({ width = 200, height = 40, variant = 'default' } = {}) {
    const vb = '0 0 200 40';

    const _build = (textColor, cls) =>
        `<svg class="${cls}" width="${width}" height="${height}" viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg">` +
        `<text x="2" y="28" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif" font-size="24" font-weight="700" fill="${textColor}" letter-spacing="-0.5">IMF AutoML</text>` +
        `</svg>`;

    if (variant === 'default') return _build('#0F1B2D', 'app-logo');
    if (variant === 'dark')    return _build('#F0F2F8', 'app-logo app-logo--dark');
    const svgLight = _build('#0F1B2D', 'app-logo');
    const svgDark  = _build('#F0F2F8', 'app-logo app-logo--dark');
    return `<span class="app-logo-wrap">${svgLight}${svgDark}</span>`;
}

export function renderAppLogoMark({ width = 40, height = 40 } = {}) {
    return `<span class="app-logo-mark" style="display: flex; align-items: center; justify-content: center; width: ${width}px; height: ${height}px; border-radius: 8px; background-color: #6C63FF; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 18px; font-weight: 700; color: white; letter-spacing: -0.5px;">AM</span>`;
}
