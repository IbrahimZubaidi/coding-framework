import { t } from '../../services/i18n.js';
import { getIcon } from '../icons.js';

// ─── renderProductCard ───────────────────────────────
// Props (all optional):
//   id              number
//   name            string
//   background_url  string
//   discount_pct    number                          — e.g. 20 → "20% OFF" badge top-right
//   tags            [string]                        — badge(s) top-left
//   instructors     [{ name, avatar_url }]          — one or more
//   subjects_count  number
//   questions_count number
//   stats           [{ value, label: { i18n, text }, icon?, iconKey? }]
//   is_subscribed   boolean
export function renderProductCard({
    id,
    name,
    description,
    background_url,
    discount_pct,
    tags            = [],
    instructors     = [],
    subjects_count  = 0,
    questions_count = 0,
    stats           = [],
    is_subscribed   = false,
} = {}) {
    const lbl = {
        off        : { i18n: '', text: 'OFF'        },
        enrolled   : { i18n: '', text: 'Enrolled'   },
        stats      : [
            {
                value   : subjects_count,
                label   : { i18n: '', text: 'S' },
                iconKey : 'subject',
            },
            {
                value   : questions_count,
                label   : { i18n: '', text: 'Q' },
                iconKey : 'question',
            },
        ],
    };

    const cardStats = (stats?.length ? stats : lbl.stats).filter(stat => stat?.value);

    const tagsHtml = tags.length ? `
        <div class="product-card__tags">
            ${tags.map(tag => `<span class="product-card__tag">${tag ?? ''}</span>`).join('')}
        </div>` : '';

    const discountHtml = discount_pct ? `
        <span class="discount-badge product-card__discount-badge">
            ${discount_pct}% ${t(lbl.off)}
        </span>` : '';

    const imageHtml = background_url ? `
        <div class="product-card__image-wrap">
            ${tagsHtml}
            ${discountHtml}
            <img class="product-card__image" src="${background_url}" alt="${name ?? ''}">
        </div>` : '';

    const instructorsHtml = instructors.length ? `
        <div class="product-card__instructors">
            ${instructors.map(ins => `
                <span class="product-card__instructor">
                    ${ins.avatar_url ? `<img class="product-card__instructor-avatar" src="${ins.avatar_url}" alt="">` : ''}
                    <span class="product-card__instructor-name">${ins.name ?? ''}</span>
                </span>`).join('')}
        </div>` : '';
    
    const nameHtml = name ? `
        <h3 class="product-card__name">${name}</h3>` : '';

    const descriptionHtml = description ? `
        <p class="product-card__description">${description}</p>` : '';

    const textHtml = (nameHtml || descriptionHtml) ? `
        <div class="product-card__text">
            ${nameHtml}
            ${descriptionHtml}
        </div>` : '';

    const statsHtml = cardStats.length ? `
        <ul class="product-card__stats">
            ${cardStats.map(stat => `
                <li class="product-card__stat">
                    ${(stat.icon ?? getIcon(stat.iconKey, 14)) ? `<span class="product-card__stat-icon">${stat.icon ?? getIcon(stat.iconKey, 14)}</span>` : ''}
                    <span class="product-card__stat-value">${stat.value}</span>
                    <span class="product-card__stat-label" data-i18n="${stat.label?.i18n ?? ''}">${t(stat.label ?? { i18n: '', text: '' })}</span>
                </li>`).join('')}
        </ul>` : '';

    const enrolledBadge = is_subscribed ? `
        <span class="product-card__enrolled-badge" data-i18n="${lbl.enrolled.i18n}">${t(lbl.enrolled)}</span>` : '';

    return `
        <a href="course.html?course_id=${id}" class="product-card card">
            ${imageHtml}
            <div class="product-card__body">
                ${enrolledBadge}
                ${textHtml}
                ${instructorsHtml}
                ${statsHtml}
            </div>
        </a>`;
}
