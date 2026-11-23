// TODO: Uncomment once Firebase is configured — import { auth } from './firebase.js';

const LOCALE_KEY = 'locale';

let _translations = {};
let _locale = null;
let _listeners = [];

// ─── State ───────────────────────────────────────────
export function getCurrentLocale() {
    return _locale;
}

export function getLocaleDir() {
    return window.APP_CONFIG.locales[_locale]?.dir || 'ltr';
}

// ─── Translate ───────────────────────────────────────
// Accepts a key string or { i18n, text } object.
// If key found in translations → translated string, else → text fallback.
export function t(keyOrLabel) {
    if (keyOrLabel && typeof keyOrLabel === 'object') {
        return _translations[keyOrLabel.i18n] || keyOrLabel.text;
    }
    return _translations[keyOrLabel] || keyOrLabel;
}

export function applyLocale(root = document.body) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const translated = _translations[key];
        if (translated) {
            el.textContent = translated;
        }
        // If translation not found, keep original text
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        const translated = _translations[key];
        if (translated) {
            el.placeholder = translated;
        }
    });
    root.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.dataset.i18nTitle;
        const translated = _translations[key];
        if (translated) {
            el.title = translated;
        }
    });
}

// ─── Listeners ───────────────────────────────────────
export function onLocaleChange(fn) {
    _listeners.push(fn);
}

// ─── Init / Set ──────────────────────────────────────
export async function initLocale() {
    const saved = localStorage.getItem(LOCALE_KEY);
    const locale = (saved && window.APP_CONFIG.locales[saved]) ? saved : window.APP_CONFIG.defaultLocale;
    await _load(locale);
    applyLocale();
}

export async function setLocale(locale) {
    if (!window.APP_CONFIG.locales[locale] || locale === _locale) return;
    localStorage.setItem(LOCALE_KEY, locale);
    await _load(locale);
    applyLocale();
    _listeners.forEach(fn => fn(locale));
}

// ─── Private ─────────────────────────────────────────
async function _load(locale) {
    const res = await fetch(`./assets/js/locales/${locale}.json`);
    _translations = await res.json();
    _locale = locale;
    document.documentElement.dir = window.APP_CONFIG.locales[locale].dir;
    document.documentElement.lang = locale;
    // TODO: Uncomment once Firebase is configured — auth.languageCode = locale;
}
