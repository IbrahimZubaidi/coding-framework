import { formatAmount } from '../utils/format.js';

const CURRENCY_KEY = 'currency';

let _active = null;
let _listeners = [];

// ─── State ───────────────────────────────────────────
export function getCurrency() {
    return window.APP_CONFIG.currencies[_active];
}

export function getCurrencyCode() {
    return _active;
}

export function getCurrencies() {
    return window.APP_CONFIG.currencies;
}

// ─── Format ──────────────────────────────────────────
// Formats amountInBase (stored in rate-base currency JOD) into a display string.
// formatPrice(10) → "10.000 JD"  (JOD active)
// formatPrice(10) → "$14.10"     (USD active)
export function formatPrice(amountInBase) {
    const { symbol, symbolAfter, decimals, rate } = getCurrency();
    const value = formatAmount(amountInBase * rate, decimals);
    return symbolAfter ? `${value} ${symbol}` : `${symbol}${value}`;
}

// ─── Listeners ───────────────────────────────────────
export function onCurrencyChange(fn) {
    _listeners.push(fn);
}

// ─── Init / Set ──────────────────────────────────────
export function initCurrency() {
    const saved = localStorage.getItem(CURRENCY_KEY);
    _active = (saved && window.APP_CONFIG.currencies[saved]) ? saved : window.APP_CONFIG.defaultCurrency;
}

export function setCurrency(code) {
    if (!window.APP_CONFIG.currencies[code] || code === _active) return;
    _active = code;
    localStorage.setItem(CURRENCY_KEY, code);
    _listeners.forEach(fn => fn(code));
}
