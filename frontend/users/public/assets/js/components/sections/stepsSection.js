import { t } from '../../services/i18n.js';
import { getIcon } from '../icons.js';

const ICON_SIZE = 20;

// ─── renderStepsSection ──────────────────────────────
// options:
//   label    { i18n, text }   — optional top label above the title
//   title    { i18n, text }   — omit for a flush/embedded variant (no header, no padding)
//   subtitle { i18n, text }   — optional
//   cards    [{ icon, title, description }]
//   numbered boolean          — show step numbers (01, 02…) top-right of each card
//
// Columns and compact sizing are auto-derived from cards.length (≥4 → compact).
export function renderStepsSection({ label, title, subtitle, cards = [], numbered = false }) {
    const cols    = cards.length || 3;
    const compact = cols >= 4;
    const classes = [
        'steps-section',
        compact ? 'steps-section--compact' : '',
        !title  ? 'steps-section--flush'   : '',
    ].filter(Boolean).join(' ');
    return `
        <section class="${classes}" style="--steps-cols: ${cols}">
            ${title ? `
            <div class="steps-section__header">
                ${label    ? `<p  class="steps-section__label"    data-i18n="${label.i18n}"   >${t(label)   }</p>`  : ''}
                <h2        class="steps-section__title"           data-i18n="${title.i18n}"   >${t(title)   }</h2>
                ${subtitle ? `<p  class="steps-section__subtitle" data-i18n="${subtitle.i18n}">${t(subtitle)}</p>`  : ''}
            </div>` : ''}
            <div class="steps-section__grid">
                ${cards.map((card, i) => renderStepCard(card, numbered ? i + 1 : null)).join('')}
            </div>
        </section>`;
}

function renderStepCard({ icon, title, description }, number) {
    const svg = getIcon(icon, ICON_SIZE);
    return `
        <div class="step-card">
            <div class="step-card__top">
                <span class="step-card__icon-wrap">${svg}</span>
                ${number != null ? `<span class="step-card__number">${String(number).padStart(2, '0')}</span>` : ''}
            </div>
            <h3 class="step-card__title"       data-i18n="${title.i18n}"      >${t(title)      }</h3>
            <p  class="step-card__description" data-i18n="${description.i18n}">${t(description)}</p>
        </div>`;
}
