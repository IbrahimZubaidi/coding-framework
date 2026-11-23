import { t } from '../services/i18n.js';

// ─── renderSectionHeader ─────────────────────────────
// Reusable page-section header: title + subtitle on the left,
// action buttons on the right.
//
// options:
//   title    { i18n, text }           — required
//   subtitle { i18n, text } | string  — optional; string used as-is (dynamic counts)
//   buttons  [{ label: { i18n, text }, href?, action?, variant? }]
//             variant: 'primary' (default) | 'outline'
export function renderSectionHeader({ title, subtitle, buttons = [] } = {}) {
    const subtitleHtml = subtitle
        ? typeof subtitle === 'string'
            ? `<p class="section-header__subtitle">${subtitle}</p>`
            : `<p class="section-header__subtitle" data-i18n="${subtitle.i18n}">${t(subtitle)}</p>`
        : '';

    const buttonsHtml = buttons.map(btn => {
        const cls  = btn.variant === 'outline' ? 'btn btn--outline' : 'btn';
        const i18n = btn.label?.i18n ?? '';
        return btn.href
            ? `<a href="${btn.href}" class="${cls}" data-i18n="${i18n}">${t(btn.label)}</a>`
            : `<button class="${cls}" data-action="${btn.action ?? ''}" data-i18n="${i18n}">${t(btn.label)}</button>`;
    }).join('');

    return `
        <div class="section-header">
            <div class="section-header__left">
                <h1 class="section-header__title" data-i18n="${title.i18n}">${t(title)}</h1>
                ${subtitleHtml}
            </div>
            ${buttonsHtml ? `<div class="section-header__actions">${buttonsHtml}</div>` : ''}
        </div>`;
}
