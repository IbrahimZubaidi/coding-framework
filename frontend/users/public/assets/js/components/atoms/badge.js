import { t } from '../../services/i18n.js';
import { getIcon } from '../icons.js';

// ─── renderTag ───────────────────────────────────────
// label { i18n, text }
export function renderTag(label) {
    if (!label) return '';
    return `
        <span class="tag">
            <span class="tag__text" data-i18n="${label.i18n}">${t(label)}</span>
        </span>`;
}

// ─── renderBadge ─────────────────────────────────────
// label { i18n, text }
// icon  string  — icon key (e.g. 'lightning', 'book'). optional
export function renderBadge(label, icon = '') {
    if (!label) return '';
    const svg = getIcon(icon, 13);
    return `
        <span class="badge">
            ${svg ? `<span class="badge__icon">${svg}</span>` : ''}
            <span class="badge__text" data-i18n="${label.i18n}">${t(label)}</span>
        </span>`;
}
