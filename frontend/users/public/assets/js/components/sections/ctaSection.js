import { t } from '../../services/i18n.js';

export function renderCtaSection({ title, subtitle, cta }) {
    return `
        <section class="cta-section">
            <div class="cta-section__content">
                <h2 class="cta-section__title" data-i18n="${title.i18n}">${t(title)}</h2>
                ${subtitle ? `<p class="cta-section__subtitle" data-i18n="${subtitle.i18n}">${t(subtitle)}</p>` : ''}
                <a href="${cta.href}" class="cta-section__btn btn btn--lg" data-i18n="${cta.label.i18n}">${t(cta.label)}</a>
            </div>
        </section>`;
}
