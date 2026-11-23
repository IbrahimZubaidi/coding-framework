import { t } from '../services/i18n.js';

// ─── renderStatsBar ──────────────────────────────────
// Horizontal strip of stat items (value + label + optional icon).
//
// items  [{ value: string, label: { i18n, text }, icon?: svgString }]
export function renderStatsBar(items = []) {
    if (!items.length) return '';
    return `
        <div class="stats-bar">
            ${items.map(item => `
                <div class="stats-bar__item">
                    ${item.icon ? `<span class="stats-bar__icon">${item.icon}</span>` : ''}
                    <span class="stats-bar__value">${item.value}</span>
                    <span class="stats-bar__label" data-i18n="${item.label.i18n}">${t(item.label)}</span>
                </div>`).join('')}
        </div>`;
}
