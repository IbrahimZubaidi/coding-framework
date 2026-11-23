import { t } from '../../services/i18n.js';

// ─── renderActionCard ─────────────────────────────────
// Props:
//   icon        string  — SVG HTML for the top-left icon
//   iconBg      string  — CSS color for icon container background
//   iconColor   string  — CSS color applied as `color` on the icon
//   badge       object  — { i18n, text } badge shown top-right (e.g. '1 sessions'); omit to hide
//   badgeStyle  string  — 'default' | 'accent' (green text, accent bg); default: 'default'
//   title       object  — { i18n, text } card heading
//   description object  — { i18n, text } supporting text below heading
//   actions     array   — array of action button descriptors:
//                         { label: { i18n, text }, href, style: 'primary'|'dark'|'ghost'|'ghost-green' }
//                         style 'primary'     → orange btn  (btn btn--lg)
//                               'dark'        → dark btn    (btn btn--dark btn--lg)
//                               'ghost'       → ghost btn   (btn btn--ghost btn--lg)
//                               'ghost-green' → green ghost (btn btn--ghost-green btn--lg)
export function renderActionCard({
    icon       = null,
    iconBg     = null,
    iconColor  = null,
    badge      = null,
    badgeStyle = 'default',
    title      = { i18n: '', text: '' },
    description = { i18n: '', text: '' },
    actions    = [],
} = {}) {
    const iconStyles = [
        iconBg    ? `background:${iconBg}`  : '',
        iconColor ? `color:${iconColor}`    : '',
    ].filter(Boolean).join(';');

    const iconHtml = icon ? `
        <div class="action-card__icon"${iconStyles ? ` style="${iconStyles}"` : ''}>
            ${icon}
        </div>` : '';

    const badgeHtml = badge ? `
        <span class="action-card__badge${badgeStyle === 'accent' ? ' action-card__badge--accent' : ''}"
              data-i18n="${badge.i18n}">${t(badge)}</span>` : '';

    const actionsHtml = actions.map(a => {
        const cls = a.style === 'dark'        ? 'btn btn--dark btn--lg'
                  : a.style === 'ghost'       ? 'btn btn--ghost btn--lg'
                  : a.style === 'ghost-green' ? 'btn btn--ghost-green btn--lg'
                  :                            'btn btn--lg';
        return `<a href="${a.href}" class="${cls}" data-i18n="${a.label.i18n}">${t(a.label)}</a>`;
    }).join('');

    return `
        <div class="action-card card">
            <div class="action-card__top">
                ${iconHtml}
                ${badgeHtml}
            </div>
            <div class="action-card__body">
                <h3 class="action-card__title" data-i18n="${title.i18n}">${t(title)}</h3>
                <p class="action-card__description" data-i18n="${description.i18n}">${t(description)}</p>
            </div>
            <div class="action-card__actions">
                ${actionsHtml}
            </div>
        </div>`;
}
