// ─── Environment ─────────────────────────────────────
const environment = window.APP_CONFIG?.environment;

export const isDevelopment =
    environment === 'development' ||
    (!environment && ['localhost', '127.0.0.1'].includes(window.location.hostname));

// ─── Logging ─────────────────────────────────────────
const COLOR_MAP = {
    red    : '#e53e3e',
    green  : '#38a169',
    blue   : '#3182ce',
    orange : '#f6a623',
    yellow : '#d69e2e',
    purple : '#805ad5',
    pink   : '#d53f8c',
    grey   : '#718096',
    gray   : '#718096',
    teal   : '#2c7a7b',
    cyan   : '#0987a0',
    white  : '#ffffff',
    black  : '#1a202c',
};

export function logMessage(label, value, color) {
    if (!isDevelopment) return;
    if (!color) { console.log(label, value); return; }
    const hex = COLOR_MAP[color] ?? color;
    const style = `color: ${hex}; font-weight: 600`;
    value === undefined
        ? console.log(`%c${label}`, style)
        : console.log(`%c${label}`, style, value);
}

export function logError(label, value) {
    if (!isDevelopment) return;
    console.error(label, value);
}

export function logGroup(title, collapsed = true, color) {
    if (!isDevelopment) return;
    if (color) {
        const hex   = COLOR_MAP[color] ?? color;
        const style = `color: ${hex}; font-weight: 600`;
        collapsed ? console.groupCollapsed(`%c${title}`, style) : console.group(`%c${title}`, style);
    } else {
        collapsed ? console.groupCollapsed(title) : console.group(title);
    }
}

export function logGroupEnd() {
    if (!isDevelopment) return;
    console.groupEnd();
}

// ─── Config Debug ─────────────────────────────────────
// Prints the user's current runtime config to the console (dev only).
export function logConfig() {
    if (!isDevelopment) return;
    logGroup('App Config');
    logMessage('App',         window.APP_CONFIG?.appName);
    logMessage('Environment', window.APP_CONFIG?.environment);
    logMessage('Locale',      localStorage.getItem('locale')    ?? window.APP_CONFIG?.defaultLocale);
    logMessage('Currency',    localStorage.getItem('currency')  ?? window.APP_CONFIG?.defaultCurrency);
    logMessage('Theme',       localStorage.getItem('themeMode') ?? 'light');
    logGroupEnd();
}

logConfig();