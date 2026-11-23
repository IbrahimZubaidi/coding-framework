import { t } from '../services/i18n.js';

// ─── renderSearchInput ───────────────────────────────
// Layout: [🔍 icon] [input field] [Search button]
//
// options:
//   placeholder { i18n, text }  — optional
//   name        string          — optional, for form use
export function renderSearchInput({ placeholder, name } = {}) {
    const labels = {
        btn: { i18n: '', text: 'Search' },
    };
    return `
        <div class="search-input">
            <span class="search-input__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </span>
            <input
                class="search-input__field"
                type="search"
                ${name ? `name="${name}"` : ''}
                ${placeholder ? `placeholder="${t(placeholder)}" data-i18n-placeholder="${placeholder.i18n ?? ''}"` : ''}
            >
            <button class="search-input__btn btn btn--dark" type="button" data-i18n="${labels.btn.i18n}">
                ${t(labels.btn)}
            </button>
        </div>`;
}
