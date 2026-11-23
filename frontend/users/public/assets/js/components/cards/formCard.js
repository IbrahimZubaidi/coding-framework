import { t } from '../../services/i18n.js';

/**
 * Renders a labelled form card — icon header + arbitrary body content.
 *
 * @param {object} opts
 * @param {string}  opts.iconSvg   - raw SVG string for the header icon
 * @param {object}  opts.title     - { i18n, text } label shown beside the icon
 * @param {string}  opts.body      - HTML string for the card body
 * @param {string}  [opts.hint]    - optional hint paragraph injected before body
 * @param {object}  [opts.hintI18n] - { i18n, text } for the hint (required when hint is set)
 * @param {string}  [opts.extraClass] - extra class(es) appended to the root element
 */
export function renderFormCard({ iconSvg, title, body, hint = null, hintI18n = null, extraClass = '' }) {
    const hintHtml = hint
        ? `<p class="form-card__hint" data-i18n="${hintI18n?.i18n ?? ''}">${hint}</p>`
        : '';

    return `
        <div class="form-card card${extraClass ? ` ${extraClass}` : ''}">
            <div class="form-card__header">
                <span class="form-card__icon">${iconSvg}</span>
                <span class="form-card__title" data-i18n="${title.i18n}">${t(title)}</span>
            </div>
            ${hintHtml}
            ${body}
        </div>`;
}
