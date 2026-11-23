import { t } from '../../services/i18n.js';
import { renderAppLogo } from '../icons.js';
import {
    EMAIL_SVG,
    FACEBOOK_SVG,
    GITHUB_SVG,
    INSTAGRAM_SVG,
    LINKEDIN_SVG,
    LOCATION_SVG,
    TELEGRAM_SVG,
    WHATSAPP_SVG
} from './footerIcons.js';
import { footerBrand, footerSections, footerSocials, bottomFooterPages } from './footerItems.js';

// ─── Constants ───────────────────────────────────────
const FOOTER_ICON_MAP = {
    email    : EMAIL_SVG,
    whatsapp : WHATSAPP_SVG,
    location : LOCATION_SVG,
    instagram: INSTAGRAM_SVG,
    facebook : FACEBOOK_SVG,
    telegram : TELEGRAM_SVG,
    github   : GITHUB_SVG,
    linkedin : LINKEDIN_SVG,
};

// ─── Renderers ───────────────────────────────────────
function renderFooterSectionColumnsHtml(columns) {
    return columns.map(column => renderFooterSectionColumnHtml(column, column.pages)).join('');
}

function renderFooterSectionColumnHtml(column, pages) {
    return `
    <div class="footer-section">
        <div class="footer-section__title" data-i18n="${column.i18n}">${t(column)}</div>
        ${renderFooterLinkListHtml(pages)}
    </div>`;
}

function renderFooterLinkContentHtml(page) {
    const iconHtml = page.icon ? `<span>${FOOTER_ICON_MAP[page.icon] || ''}</span>` : '';
    const nameHtml = page.text
        ? `<span data-i18n="${page.i18n}">${t(page)}</span>`
        : page.name ? `<span>${page.name}</span>` : '';
    return `${iconHtml}${nameHtml}`;
}

function getLinkTargetAttributes(url) {
    if (!url) return '';
    const opensInNewTab = /^(https?:\/\/|mailto:)/i.test(url);
    return opensInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
}

function renderFooterLinkListHtml(pages) {
    return `
    <ul class="footer-links">
        ${pages.map(page => `
            <li class="footer-links__item">
                ${page.url
                    ? `<a href="${page.url}"${getLinkTargetAttributes(page.url)}>${renderFooterLinkContentHtml(page)}</a>`
                    : `<span>${renderFooterLinkContentHtml(page)}</span>`
                }
            </li>
        `).join('')}
    </ul>`;
}

function renderFooterSocialsHtml(socials) {
    return `
    <ul class="footer-socials">
        ${socials.map(social => `
            <li class="footer-socials__item">
                <a href="${social.url}" aria-label="${t(social)}"${getLinkTargetAttributes(social.url)}>${FOOTER_ICON_MAP[social.icon] || ''}</a>
            </li>
        `).join('')}
    </ul>`;
}

// ─── Render ──────────────────────────────────────────
export function renderFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    footer.innerHTML = `
    <div class="footer">
        <div class="footer__content">
            <div class="footer__brand">
                <a href="home.html">
                    ${renderAppLogo({ variant: 'dark' })}
                </a>
                <p data-i18n="${footerBrand.tagline.i18n}">${t(footerBrand.tagline)}</p>
                ${renderFooterSocialsHtml(footerSocials)}
            </div>
            ${renderFooterSectionColumnsHtml(footerSections)}
        </div>

        <div class="footer__bottom">
            <div class="footer__copyright" data-i18n="${footerBrand.copyright.i18n}">${t(footerBrand.copyright)}</div>
            ${renderFooterLinkListHtml(bottomFooterPages)}
        </div>
    </div>`;
}
