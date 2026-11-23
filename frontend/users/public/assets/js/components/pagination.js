import { t } from '../services/i18n.js';
import { buildPageNumbers } from '../utils/format.js';

const LABELS = {
    prev: { i18n: '', text: 'Prev' },
    next: { i18n: '', text: 'Next' },
};

// ─── renderPagination ─────────────────────────────────
// pagination: { current_page, total_pages, has_next_page, has_previous_page }
// Returns HTML string. Returns '' if total_pages <= 1.
export function renderPagination(pagination) {
    if (!pagination || pagination.total_pages <= 1) return '';

    const { current_page, total_pages, has_next_page, has_previous_page } = pagination;
    const pageButtons = buildPageNumbers(current_page, total_pages).map(p =>
        p === '...'
            ? `<span class="pagination__ellipsis">…</span>`
            : `<a class="pagination__btn${p === current_page ? ' pagination__btn--active' : ''}" href="#" data-page="${p}">${p}</a>`
    ).join('');

    return `
        <div class="pagination">
            <a class="pagination__btn pagination__btn--nav${!has_previous_page ? ' pagination__btn--disabled' : ''}" href="#" data-page="${current_page - 1}" ${!has_previous_page ? 'tabindex="-1" aria-disabled="true"' : ''} data-i18n="${LABELS.prev.i18n}">${t(LABELS.prev)}</a>
            ${pageButtons}
            <a class="pagination__btn pagination__btn--nav${!has_next_page ? ' pagination__btn--disabled' : ''}" href="#" data-page="${current_page + 1}" ${!has_next_page ? 'tabindex="-1" aria-disabled="true"' : ''} data-i18n="${LABELS.next.i18n}">${t(LABELS.next)}</a>
        </div>`;
}
