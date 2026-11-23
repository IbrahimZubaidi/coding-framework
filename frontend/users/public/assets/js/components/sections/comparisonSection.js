import { t } from '../../services/i18n.js';
import { getIcon } from '../icons.js';

const ICON_SIZE = 16;

export function renderComparisonSection({ label, title, subtitle, cards = [] }) {
    return `
        <section class="comparison-section">
            <div class="comparison-section__header">
                ${label    ? `<p class="comparison-section__label" data-i18n="${label.i18n}">${t(label)}</p>` : ''}
                ${title    ? `<h2 class="comparison-section__title" data-i18n="${title.i18n}">${t(title)}</h2>` : ''}
                ${subtitle ? `<p class="comparison-section__subtitle" data-i18n="${subtitle.i18n}">${t(subtitle)}</p>` : ''}
            </div>
            <div class="comparison-section__grid">
                ${cards.map(card => renderComparisonCard(card)).join('')}
            </div>
        </section>`;
}

function renderComparisonCard({ badge, title, description, items = [], theme = 'light' }) {
    const checkSvg = getIcon('check-circle', ICON_SIZE);
    return `
        <div class="comparison-card comparison-card--${theme}">
            <span class="comparison-card__badge" data-i18n="${badge.i18n}">${t(badge)}</span>
            <h3 class="comparison-card__title" data-i18n="${title.i18n}">${t(title)}</h3>
            <p class="comparison-card__description" data-i18n="${description.i18n}">${t(description)}</p>
            <ul class="comparison-card__items">
                ${items.map(item => `
                    <li class="comparison-card__item">
                        <span class="comparison-card__item-icon">${checkSvg}</span>
                        <span class="comparison-card__item-text" data-i18n="${item.i18n}">${t(item)}</span>
                    </li>
                `).join('')}
            </ul>
        </div>`;
}
