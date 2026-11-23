import { t } from '../../services/i18n.js';

const BACK_ICON = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.50004 10.2917L2.70837 6.50001L6.50004 2.70834" stroke="white" stroke-opacity="0.5" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.2917 6.5H2.70837" stroke="white" stroke-opacity="0.5" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ─── renderBreadcrumb ────────────────────────────────
// Trail of links separated by a chevron; last item is current page (no link).
//
// items [{ label: { i18n, text }, href?: string }]
// back  { href: string, label: { i18n, text } }  — optional back link shown before the trail
export function renderBreadcrumb(items = [], back = null) {
    if (!items.length && !back) return '';
    const backHtml = back
        ? `<a class="breadcrumb__back" href="${back.href}">${BACK_ICON}</a>`
        : '';
    return `
        <nav class="breadcrumb" aria-label="breadcrumb">
            ${backHtml}
            ${items.map((item, i) => {
                const isLast = i === items.length - 1;
                const label = `<span data-i18n="${item.label.i18n}">${t(item.label)}</span>`;
                return `
                    <span class="breadcrumb__item ${isLast ? 'breadcrumb__item--current' : ''}">
                        ${!isLast && item.href ? `<a class="breadcrumb__link" href="${item.href}">${label}</a>` : label}
                        ${!isLast ? '<span class="breadcrumb__sep" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 9L7.5 6L4.5 3" stroke="white" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : ''}
                    </span>`;
            }).join('')}
        </nav>`;
}