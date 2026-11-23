import { t } from '../../services/i18n.js';

// ─── Spinner ─────────────────────────────────────────
export function getLoadingHtml() {
    const label = { i18n: '', text: 'Loading...' };
    return `
    <div class="spinner-wrapper">
        <div class="spinner-border" role="status">
            <span class="visually-hidden" data-i18n="${label.i18n}">${t(label)}</span>
        </div>
    </div>`;
}

const BTN_SPINNER = `<span class="btn-spinner" aria-hidden="true"></span>`;

// ─── Button Loading ──────────────────────────────────
// loadingLabel must follow { i18n: '', text: '...' } pattern
// so applyLocale() can update the loading text if locale changes mid-flight.
// The button itself must have data-i18n set in HTML so the original
// text can be re-translated (not restored from a stale snapshot).
export function setButtonLoading(button, loadingLabel = { i18n: '', text: 'Submitting...' }) {
    if (!button) return;
    button.disabled = true;
    button.dataset.originalI18n = button.dataset.i18n ?? '';
    button.dataset.originalHtml = button.innerHTML;             // fallback for keyless buttons
    button.removeAttribute('data-i18n');                        // prevent applyLocale wiping spinner mid-flight
    button.innerHTML = `${BTN_SPINNER}<span data-i18n="${loadingLabel.i18n}">${t(loadingLabel)}</span>`;
    button.setAttribute('aria-busy', 'true');
}

export function clearButtonLoading(button) {
    if (!button) return;
    button.disabled = false;
    const key = button.dataset.originalI18n;
    button.dataset.i18n = key;
    // key present → re-translate for current locale; absent → restore original HTML
    button.innerHTML = key ? t(key) : button.dataset.originalHtml || '';
    delete button.dataset.originalI18n;
    delete button.dataset.originalHtml;
    button.removeAttribute('aria-busy');
}
