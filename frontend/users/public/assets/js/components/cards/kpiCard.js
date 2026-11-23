import { t } from '../../services/i18n.js';

// ─── renderKpiCard ───────────────────────────────────
// Props (all optional except value + label):
//   icon       string  — SVG HTML; omit to render without icon
//   iconBg     string  — CSS color for the icon container background
//   iconColor  string  — CSS color applied as `color` on the icon (SVGs use currentColor)
//   value      string  — main large display value, e.g. '15', '60%'
//   label      object  — i18n label { i18n, text }
//   hint       string  — small colored sub-label at the bottom, e.g. '+24 today'
//   hintColor  string  — CSS color for the hint text (default: var(--color-primary))
//   centered   bool    — center-align all content (default: false)
export function renderKpiCard({
    icon      = null,
    iconBg    = null,
    iconColor = null,
    value     = '',
    label     = { i18n: '', text: '' },
    hint      = null,
    hintColor = 'var(--color-primary)',
    centered  = false,
} = {}) {
    const iconStyles = [
        iconBg    ? `background:${iconBg}`   : '',
        iconColor ? `color:${iconColor}`     : '',
    ].filter(Boolean).join(';');

    const iconHtml = icon ? `
        <div class="kpi-card__icon"${iconStyles ? ` style="${iconStyles}"` : ''}>
            ${icon}
        </div>` : '';

    const hintHtml = hint
        ? `<p class="kpi-card__hint" style="color:${hintColor}">${hint}</p>`
        : '';

    return `
        <div class="kpi-card card${centered ? ' kpi-card--centered' : ''}">
            ${iconHtml}
            <div class="kpi-card__content">
                <p class="kpi-card__value">${value}</p>
                <p class="kpi-card__label" data-i18n="${label.i18n}">${t(label)}</p>
                ${hintHtml}
            </div>
        </div>`;
}
