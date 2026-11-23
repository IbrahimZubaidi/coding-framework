import { t } from '../services/i18n.js';

// ─── renderDataTable ─────────────────────────────────
// Generic table with optional toolbar (search, filter chips, sort).
//
// config:
//   containerId    string                             — optional id on the wrapper div
//   toolbarSearch  { placeholder: { i18n, text } }   — optional search field
//   toolbarChips   [{ label, value }]                 — optional filter chips; first is default active
//   toolbarEnd     string                             — optional raw HTML injected at the right of the toolbar
//   columns        [{ key, label, width?, sortable? }]— table column headers
//   rows           any[]                              — raw data rows
//   renderRow      (row) => string                    — returns a <tr> HTML string per row
//   emptyLabel     { i18n, text }                     — shown when rows is empty
//   footer         string                             — optional raw HTML below the table (e.g. pagination)
//
// The rendered element emits:
//   'table:search'  CustomEvent({ detail: { value } })      on search input
//   'table:chip'    CustomEvent({ detail: { value } })      on chip click
//   'table:sort'    CustomEvent({ detail: { key, order } }) on sortable header click

const TEXT = {
    empty      : { i18n: '', text: 'No results found.' },
    searchBtn  : { i18n: '', text: 'Search'            },
};

export function renderDataTable(config = {}) {
    const {
        containerId,
        toolbarSearch,
        toolbarChips = [],
        toolbarEnd   = '',
        columns      = [],
        rows         = [],
        renderRow,
        emptyLabel,
        footer       = '',
    } = config;

    const toolbarHtml = _renderToolbar(toolbarSearch, toolbarChips, toolbarEnd);
    const headHtml    = _renderHead(columns);
    const bodyHtml    = _renderBody(rows, renderRow, columns.length, emptyLabel);

    return `
        <div class="data-table-wrap" ${containerId ? `id="${containerId}"` : ''}>
            ${toolbarHtml}
            <div class="data-table-scroll">
                <table class="data-table">
                    <thead>${headHtml}</thead>
                    <tbody>${bodyHtml}</tbody>
                </table>
            </div>
            ${footer ? `<div class="data-table-footer">${footer}</div>` : ''}
        </div>`;
}

// ─── Toolbar ─────────────────────────────────────────
function _renderToolbar(search, chips, end) {
    if (!search && !chips.length && !end) return '';

    const searchHtml = search ? `
        <div class="data-table-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
                class="data-table-search__input"
                type="search"
                ${search.placeholder ? `placeholder="${t(search.placeholder)}" data-i18n-placeholder="${search.placeholder.i18n}"` : ''}
            >
        </div>` : '';

    const chipsHtml = chips.length ? `
        <div class="data-table-chips">
            ${chips.map((chip, i) => `
                <button
                    class="data-table-chip${i === 0 ? ' is-active' : ''}"
                    data-chip-value="${chip.value ?? ''}"
                    data-i18n="${chip.label.i18n}"
                >${t(chip.label)}</button>`
            ).join('')}
        </div>` : '';

    return `<div class="data-table-toolbar">${searchHtml}${chipsHtml}${end ? `<div class="data-table-toolbar__end">${end}</div>` : ''}</div>`;
}

// ─── Head ─────────────────────────────────────────────
function _renderHead(columns) {
    const cells = columns.map(col => `
        <th
            class="data-table__th${col.sortable ? ' is-sortable' : ''}"
            ${col.width ? `style="width:${col.width}"` : ''}
            data-col-key="${col.key ?? ''}"
            data-i18n="${col.label?.i18n ?? ''}"
        >${t(col.label)}</th>`
    ).join('');

    return `<tr>${cells}</tr>`;
}

// ─── Body ─────────────────────────────────────────────
function _renderBody(rows, renderRow, colCount, emptyLabel) {
    if (!rows.length) {
        const label = emptyLabel ?? TEXT.empty;
        return `<tr><td class="data-table__empty" colspan="${colCount}" data-i18n="${label.i18n}">${t(label)}</td></tr>`;
    }
    return rows.map(row => renderRow(row)).join('');
}

// ─── initDataTable ────────────────────────────────────
// Wires search + chip events on a rendered data-table-wrap.
// Call once after inserting the HTML into the DOM.
//
// container  Element | string (selector)
export function initDataTable(container) {
    const el = typeof container === 'string'
        ? document.querySelector(container)
        : container;
    if (!el) return;

    // · Search — fires on Enter or native clear (×)
    const searchInput = el.querySelector('.data-table-search__input');
    if (searchInput) {
        const dispatchSearch = () => el.dispatchEvent(
            new CustomEvent('table:search', { bubbles: true, detail: { value: searchInput.value.trim() } })
        );
        searchInput.addEventListener('search',  dispatchSearch);
        searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); dispatchSearch(); } });
    }

    // · Chips (multi-select; chip with empty value = "All" = clear others)
    el.addEventListener('click', e => {
        const chip = e.target.closest('.data-table-chip');
        if (!chip) return;

        const allChips = [...el.querySelectorAll('.data-table-chip')];
        const allChip  = allChips.find(c => c.dataset.chipValue === '');

        if (chip.dataset.chipValue === '') {
            allChips.forEach(c => c.classList.remove('is-active'));
            chip.classList.add('is-active');
        } else {
            allChip?.classList.remove('is-active');
            chip.classList.toggle('is-active');
            if (!allChips.some(c => c !== allChip && c.classList.contains('is-active'))) {
                allChip?.classList.add('is-active');
            }
        }

        const selected = allChips
            .filter(c => c.classList.contains('is-active') && c.dataset.chipValue !== '')
            .map(c => c.dataset.chipValue);

        el.dispatchEvent(new CustomEvent('table:chip', { bubbles: true, detail: { values: selected } }));
    });

    // · Sortable headers
    el.addEventListener('click', e => {
        const th = e.target.closest('.data-table__th.is-sortable');
        if (!th) return;

        const current = th.dataset.sortOrder ?? 'asc';
        const next    = current === 'asc' ? 'desc' : 'asc';
        el.querySelectorAll('.data-table__th').forEach(h => delete h.dataset.sortOrder);
        th.dataset.sortOrder = next;
        el.dispatchEvent(new CustomEvent('table:sort', { bubbles: true, detail: { key: th.dataset.colKey, order: next } }));
    });
}
