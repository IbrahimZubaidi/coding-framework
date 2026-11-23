import { t } from '../../services/i18n.js';
import { renderBadge, renderTag } from '../atoms/badge.js';
import { renderBreadcrumb } from '../atoms/breadcrumb.js';
import { renderSearchInput } from '../searchInput.js';
import { getIcon } from '../icons.js';
import { logMessage } from '../../services/logger.js';

// ─── Hero Components ──────────────────────────────────

// ─── heroSimple ──────────────────────────────────────
// Centered: badge · title · subtitle · search (optional)
//
// options:
//   badge    { label: { i18n, text }, icon: iconKey }    — optional  (e.g. 'lightning', 'book')
//   title    { part1: { i18n, text }, part2?, part3? }
//   subtitle { i18n, text }                              — optional
//   search   { placeholder: { i18n, text } }             — optional
export function heroSimple({
    badge,
    title,
    subtitle,
    search,
} = {}) {
    return `
        <section class="hero-simple">
            ${renderBadge(badge?.label, badge?.icon)}
            ${renderTitle(title)}
            ${subtitle ? `<p class="hero-simple__subtitle" data-i18n="${subtitle.i18n}">${t(subtitle)}</p>` : ''}
            ${search ? renderSearchInput(search) : ''}
        </section>`;
}

// ─── heroArticle ─────────────────────────────────────
// Full-width section with background image overlay.
// breadcrumb · tags · title · meta (instructors + date + read time)
//
// options:
//   bg           string                                         — background image url
//   breadcrumb   [{ label: { i18n, text }, href?: string }]    — optional
//   tags         [{ i18n, text }]                              — optional, all shown as orange pills
//   title        { part1: { i18n, text }, part2?, part3? }
//   instructors  [{ image: string, name: string, field: string }]  — optional
//   date         string                                         — ISO date string
//   readTime     { i18n, text }                                 — e.g. { text: '8 min read' }
export function heroArticle({
    bg,
    breadcrumb,
    back,
    tags,
    title,
    instructors,
    date,
    readTime,
} = {}) {
    const tagsHtml = tags?.length
        ? `<div class="hero-article__tags">${tags.map(tag => `<span class="hero-article__tag" data-i18n="${tag.i18n}">${t(tag)}</span>`).join('')}</div>`
        : '';
    const readTimeHtml = readTime
        ? `<span class="hero-article__read-time">${getIcon('clock', 13)} <span data-i18n="${readTime.i18n}">${t(readTime)}</span></span>`
        : '';
    return `
        <section class="hero-article"${bg ? ` style="--hero-bg-image: url('${bg}')"` : ''}>
            <div class="container">
                <div class="hero-article__inner">
                    ${renderBreadcrumb(breadcrumb, back)}
                    ${tagsHtml}
                    ${renderTitle(title)}
                    <div class="hero-article__meta">
                        ${renderInstructors(instructors ?? [])}
                        <div class="hero-article__meta-info">
                            ${date ? `<span class="hero-article__date">${date}</span>` : ''}
                            ${readTimeHtml}
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
}

// ─── heroSplit ───────────────────────────────────────
// Left col : badge · title · subtitle · search · chips
// Right col: image · kpi cards
//
// options:
//   badge    { label: { i18n, text }, icon: iconKey }    — optional  (e.g. 'lightning', 'book')
//   title    { part1: { i18n, text }, part2?, part3? }
//   subtitle { i18n, text }
//   search   { placeholder: { i18n, text } }             — optional
//   chips    [{ i18n, text }]                             — optional
//   image    { src, alt }                                 — optional
//   kpis     [{ label: { i18n, text }, value: string }]  — optional
export function heroSplit({
    badge,
    title,
    subtitle,
    search,
    chips,
    image,
    kpis,
} = {}) {
    const chipsHtml = chips?.length ? `
        <div class="hero-split__chips">
            ${chips.map(chip => `
                <button class="hero-split__chip" type="button" data-i18n="${chip.i18n}">${t(chip)}</button>
            `).join('')}
        </div>` : '';

    const kpisHtml = kpis?.length ? `
        <div class="hero-split__kpis">
            ${kpis.map(kpi => `
                <div class="hero-split__kpi">
                    <div class="hero-split__kpi-value">${kpi.value}</div>
                    <div class="hero-split__kpi-label" data-i18n="${kpi.label?.i18n ?? ''}">${t(kpi.label)}</div>
                </div>
            `).join('')}
        </div>` : '';

    const imageHtml = image ? `
        <div class="hero-split__image-wrap">
            <img class="hero-split__image" src="${image.src}" alt="${image.alt ?? ''}">
        </div>` : '';

    return `
        <section class="hero-split">
            <div class="hero-split__left">
                ${renderBadge(badge?.label, badge?.icon)}
                ${renderTitle(title)}
                ${subtitle ? `<p class="hero-split__subtitle" data-i18n="${subtitle.i18n}">${t(subtitle)}</p>` : ''}
                ${search ? renderSearchInput(search) : ''}
                ${chipsHtml}
            </div>
            <div class="hero-split__right">
                ${imageHtml}
                ${kpisHtml}
            </div>
        </section>`;
}

// ─── heroCourse ──────────────────────────────────────
// Left col : breadcrumb · tags · title · subtitle · stats · instructors
// Right col: offer card (image · price · buttons · benefits · footer)
// "View other offers" dispatches 'hero:viewOffers' — page handles the action.
//
// options:
//   breadcrumb   [{ label: { i18n, text }, href?: string }]               — optional
//   tags         [{ i18n, text }]                                          — optional
//   title        { part1: { i18n, text }, part2?, part3? }
//   subtitle     { i18n, text }                                            — optional
//   stats        [{ icon: svgString, value: string, label: { i18n, text } }]
//   instructors  [{ image: string, name: string, field: string }]
//   offer        { image?, price, oldPrice?, subscribed, benefits, footerNote? }
//     benefits   [{ value?: string, label: { i18n, text } }]
export function heroCourse({
    breadcrumb,
    back,
    tags,
    title,
    subtitle,
    stats,
    instructors,
    offer,
    backgroundImage,
} = {}) {
    const labels = {
        instructorsLabel : { i18n: '', text: 'Instructors'       },
        subscribe        : { i18n: '', text: 'Subscribe Now'     },
        tryFree          : { i18n: '', text: 'Try for Free'      },
        dashboard        : { i18n: '', text: 'Go to Dashboard'   },
        viewOffers       : { i18n: '', text: 'View other offers' },
    };

    const tagsHtml = tags?.length ? `
        <div class="hero-course__tags">
            ${tags.map(tag => renderTag(tag)).join('')}
        </div>` : '';

    const statsHtml = stats?.length ? `
        <ul class="hero-course__stats">
            ${stats.map(stat => `
                <li class="hero-course__stat">
                    <span class="hero-course__stat-icon">${stat.icon ?? getIcon(stat.iconKey, 14)}</span>
                    <span class="hero-course__stat-value">${stat.value}</span>
                    <span class="hero-course__stat-label" data-i18n="${stat.label.i18n}">${t(stat.label)}</span>
                </li>`).join('')}
        </ul>` : '';

    return `
        <section class="hero-course"${backgroundImage ? ` style="--hero-bg-image: url('${backgroundImage}')"` : ''}>
            <div class="hero-course__left">
                ${renderBreadcrumb(breadcrumb, back)}
                ${tagsHtml}
                ${renderTitle(title)}
                ${subtitle ? `<p class="hero-course__subtitle" data-i18n="${subtitle.i18n}">${t(subtitle)}</p>` : ''}
                ${statsHtml}
                ${renderInstructors(instructors ?? [], labels.instructorsLabel)}
            </div>
            <div class="hero-course__right">
                ${offer ? renderOfferCard(offer, labels) : ''}
            </div>
        </section>`;
}

// ─── Helpers ─────────────────────────────────────────

// · Title — 1, 2, or 3 parts; part2 is always highlighted
//   { part1 }               → plain
//   { part1, part2 }        → plain  highlight
//   { part1, part2, part3 } → plain  highlight  plain
function renderTitle(title) {
    if (!title) return '';
    return `
        <h1 class="hero-title">
            ${title.part1 ? `<span class="hero-title__plain"     data-i18n="${title.part1.i18n}">${t(title.part1)}</span>` : ''}
            ${title.part2 ? `<span class="hero-title__highlight" data-i18n="${title.part2.i18n}">${t(title.part2)}</span>` : ''}
            ${title.part3 ? `<span class="hero-title__plain"     data-i18n="${title.part3.i18n}">${t(title.part3)}</span>` : ''}
        </h1>`;
}

// · Instructors — avatar + name + field
//   label { i18n, text }                              — optional section label
//   items [{ image: string, name: string, field: string }]
function renderInstructors(items = [], label = null) {
    if (!items.length) return '';
    return `
        <div class="instructors">
            ${label ? `<span class="instructors__label" data-i18n="${label.i18n}">${t(label)}</span>` : ''}
            ${items.map(instructor => `
                <div class="instructor">
                    <img class="instructor__avatar" src="${instructor.image}" alt="${instructor.name}">
                    <div class="instructor__info">
                        <span class="instructor__name">${instructor.name}</span>
                        <span class="instructor__field">${instructor.field}</span>
                    </div>
                </div>`).join('')}
        </div>`;
}

// · Offer card — renders the subscription card on the right col of heroCourse
function renderOfferCard(offer, labels) {
    const subscribeLabel = offer.price
        ? `${t(labels.subscribe)} — ${offer.price}`
        : t(labels.subscribe);
    const buttonsHtml = offer.subscribed
        ? `<a href="course-overview.html?course_id=${offer.course_id}" class="offer-card__btn offer-card__btn--dashboard btn btn--dark btn--full">
               ${getIcon('play-circle', 18)}
               <span data-i18n="${labels.dashboard.i18n}">${t(labels.dashboard)}</span>
           </a>`
        : `<a href="payment.html?course_offer_id=${offer.id}" class="offer-card__btn offer-card__btn--subscribe btn btn--full">
               <span>${subscribeLabel}</span>
           </a>
           <a href="course-overview.html?course_id=${offer.course_id}" class="offer-card__btn offer-card__btn--ghost btn btn--full" type="button">
               ${getIcon('lock-open', 16)}
               <span data-i18n="${labels.tryFree.i18n}">${t(labels.tryFree)}</span>
           </a>`;

    const benefitsHtml = offer.benefits?.length ? `
        <ul class="offer-card__benefits">
            ${offer.benefits.map(b => `
                <li class="offer-card__benefit">
                    <svg class="offer-card__benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    <span class="offer-card__benefit-text">
                        ${b.value ? `<span class="offer-card__benefit-value">${b.value}</span> ` : ''}
                        <span data-i18n="${b.label.i18n}">${t(b.label)}</span>
                    </span>
                </li>`).join('')}
        </ul>` : '';

    const discountBadge = offer.discountPct
        ? `<span class="discount-badge">${offer.discountPct}% ${t({ i18n: '', text: 'OFF' })}</span>`
        : '';

    return `
        <div class="offer-card">
            ${offer.image ? `<img class="offer-card__image" src="${offer.image}" alt="">` : ''}
            <div class="offer-card__price-row">
                <span class="offer-card__price">${offer.price}</span>
                ${offer.oldPrice ? `<span class="offer-card__old-price">${offer.oldPrice}</span>` : ''}
                ${discountBadge}
            </div>
            <div class="offer-card__actions">${buttonsHtml}</div>
            ${benefitsHtml}
            <a class="offer-card__view-offers btn-nan" href="#packagesSection" data-i18n="${labels.viewOffers.i18n}">${t(labels.viewOffers)}</a>
        </div>`;
}
