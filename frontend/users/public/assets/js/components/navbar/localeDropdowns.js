import { getCurrentLocale, setLocale, onLocaleChange } from '../../services/i18n.js';
import { getCurrencyCode, setCurrency, onCurrencyChange } from '../../services/currency.js';
import { DOWN_ARROW_SVG } from './navbarIcons.js';

let _languageListenerInitialized = false;
let _currencyListenerInitialized = false;

// ─── Language Dropdown ────────────────────────────────
export function renderLanguageDropdown() {
    const currentLocale = getCurrentLocale();
    const locales = window.APP_CONFIG.locales;

    return `
        <div class="locale-dropdown dropdown">
            <button class="locale-dropdown__toggle dropdown-toggle ghost-btn" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" type="button">
                <span class="locale-label">${locales[currentLocale]?.label || currentLocale}</span>
                <div class="dropdown-arrow">${DOWN_ARROW_SVG}</div>
            </button>
            <ul class="dropdown-menu">
                ${Object.entries(locales).map(([code, config]) => `
                    <li class="dropdown-item">
                        <button class="locale-option" data-locale="${code}" type="button">
                            ${config.label}
                        </button>
                    </li>
                `).join('')}
            </ul>
        </div>`;
}

export function initLanguageDropdown() {
    if (_languageListenerInitialized) return;
    _languageListenerInitialized = true;

    document.addEventListener('click', async (e) => {
        const localeBtn = e.target.closest('.locale-option');
        if (!localeBtn) return;

        const locale = localeBtn.dataset.locale;
        await setLocale(locale);
    });

    onLocaleChange(() => _updateLanguageDropdown());
}

function _updateLanguageDropdown() {
    const currentLocale = getCurrentLocale();
    const locales = window.APP_CONFIG.locales;
    const btn = document.querySelector('.locale-dropdown__toggle');
    if (btn) {
        btn.querySelector('.locale-label').textContent = locales[currentLocale]?.label || currentLocale;
    }
}

// ─── Currency Dropdown ────────────────────────────────
export function renderCurrencyDropdown() {
    const currentCurrency = getCurrencyCode();
    const currencies = window.APP_CONFIG.currencies;

    return `
        <div class="currency-dropdown dropdown">
            <button class="currency-dropdown__toggle dropdown-toggle ghost-btn" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" type="button">
                <span class="currency-label">${currentCurrency}</span>
                <div class="dropdown-arrow">${DOWN_ARROW_SVG}</div>
            </button>
            <ul class="dropdown-menu">
                ${Object.entries(currencies).map(([code, config]) => `
                    <li class="dropdown-item">
                        <button class="currency-option" data-currency="${code}" type="button">
                            ${code} ${config.symbol}
                        </button>
                    </li>
                `).join('')}
            </ul>
        </div>`;
}

export function initCurrencyDropdown() {
    if (_currencyListenerInitialized) return;
    _currencyListenerInitialized = true;

    document.addEventListener('click', (e) => {
        const currencyBtn = e.target.closest('.currency-option');
        if (!currencyBtn) return;

        const currency = currencyBtn.dataset.currency;
        setCurrency(currency);
    });

    onCurrencyChange(() => _updateCurrencyDropdown());
}

function _updateCurrencyDropdown() {
    const currentCurrency = getCurrencyCode();
    const btn = document.querySelector('.currency-dropdown__toggle');
    if (btn) {
        btn.querySelector('.currency-label').textContent = currentCurrency;
    }
}
