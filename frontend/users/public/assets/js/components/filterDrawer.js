import { t } from '../services/i18n.js';

const CLOSE_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

// Renders the filter drawer HTML string.
//
// config.text       — i18n text objects for all labels (title, apply, reset, university, specialty, year, price, onSale, isSubscribed)
// config.universities — array of { id, name } objects for the university select
// config.req        — current requestData object (used to pre-fill active filter state)
// config.maxPrice   — maximum value for the price slider
export function renderFilterDrawer({ text, universities, req, maxPrice }) {
    const universityOptions = universities.map(u =>
        `<option value="${u.id}" ${req.university_id == u.id ? 'selected' : ''}>${u.name}</option>`
    ).join('');

    const yearChips = [1, 2, 3, 4, 5, 6].map(y =>
        `<button class="filter-year-chip${req.year == y ? ' filter-year-chip--active' : ''}" data-year="${y}">${y}</button>`
    ).join('');

    return `
        <div class="filter-drawer" id="filter-drawer">
            <div class="filter-drawer__overlay"></div>
            <div class="filter-drawer__panel">
                <div class="filter-drawer__header">
                    <h3 class="filter-drawer__title" data-i18n="${text.title.i18n}">${t(text.title)}</h3>
                    <button class="filter-drawer__close" id="filter-drawer-close">${CLOSE_ICON}</button>
                </div>
                <div class="filter-drawer__body">
                    <div class="form-field">
                        <label for="fd-university" data-i18n="${text.university.label.i18n}">${t(text.university.label)}</label>
                        <div class="form-field__input-wrap">
                            <select id="fd-university">
                                <option value="" data-i18n="${text.university.all.i18n}">${t(text.university.all)}</option>
                                ${universityOptions}
                            </select>
                        </div>
                    </div>
                    <div class="form-field">
                        <label for="fd-specialty" data-i18n="${text.specialty.label.i18n}">${t(text.specialty.label)}</label>
                        <div class="form-field__input-wrap">
                            <select id="fd-specialty">
                                <option value="" disabled selected data-i18n="${text.specialty.default.i18n}">${t(text.specialty.default)}</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-field">
                        <label data-i18n="${text.year.label.i18n}">${t(text.year.label)}</label>
                        <div class="filter-year-chips">
                            ${yearChips}
                        </div>
                    </div>
                    <div class="form-field">
                        <div class="filter-price-label">
                            <label for="fd-max-price" data-i18n="${text.price.label.i18n}">${t(text.price.label)}</label>
                            <span class="filter-price-value" id="fd-max-price-display">${req.max_price && req.max_price < maxPrice ? req.max_price : t(text.price.any)}</span>
                        </div>
                        <input id="fd-max-price" class="filter-price-slider__input" type="range"
                            min="0" max="${maxPrice}" step="5"
                            value="${req.max_price ?? maxPrice}"
                            style="--slider-pct: ${Math.round(((req.max_price ?? maxPrice) / maxPrice) * 100)}%">
                    </div>
                    <div class="form-field">
                        <label data-i18n="${text.onSale.label.i18n}">${t(text.onSale.label)}</label>
                        <div class="filter-sale-chips" id="fd-sale-chips">
                            <button class="filter-sale-chip${!req.on_sale ? ' filter-sale-chip--active' : ''}" data-sale="" data-i18n="${text.onSale.all.i18n}">${t(text.onSale.all)}</button>
                            <button class="filter-sale-chip${req.on_sale ? ' filter-sale-chip--active' : ''}" data-sale="1" data-i18n="${text.onSale.onSale.i18n}">${t(text.onSale.onSale)}</button>
                        </div>
                    </div>
                    <div class="form-field">
                        <label data-i18n="${text.isSubscribed.label.i18n}">${t(text.isSubscribed.label)}</label>
                        <div class="filter-sale-chips" id="fd-subscribed-chips">
                            <button class="filter-sale-chip${req.is_subscribed == null ? ' filter-sale-chip--active' : ''}" data-subscribed="" data-i18n="${text.isSubscribed.all.i18n}">${t(text.isSubscribed.all)}</button>
                            <button class="filter-sale-chip${req.is_subscribed === true ? ' filter-sale-chip--active' : ''}" data-subscribed="1" data-i18n="${text.isSubscribed.subscribed.i18n}">${t(text.isSubscribed.subscribed)}</button>
                            <button class="filter-sale-chip${req.is_subscribed === false ? ' filter-sale-chip--active' : ''}" data-subscribed="0" data-i18n="${text.isSubscribed.notSubscribed.i18n}">${t(text.isSubscribed.notSubscribed)}</button>
                        </div>
                    </div>
                </div>
                <div class="filter-drawer__footer">
                    <button id="fd-reset" class="btn btn--pill" data-i18n="${text.reset.i18n}">${t(text.reset)}</button>
                    <button id="fd-apply" class="btn btn--dark btn--pill" data-i18n="${text.apply.i18n}">${t(text.apply)}</button>
                </div>
            </div>
        </div>`;
}
