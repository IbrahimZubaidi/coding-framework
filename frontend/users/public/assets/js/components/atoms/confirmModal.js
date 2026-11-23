import { t } from '../../services/i18n.js';

// ─── Confirm Modal ────────────────────────────────────
// Shows a modal with a title, body text, and confirm/cancel buttons.
// Returns a Promise<boolean> — true if confirmed, false if cancelled.
//
// options:
//   title   { i18n, text }  — modal heading
//   body    { i18n, text }  — descriptive paragraph
//   confirm { i18n, text }  — confirm button label
//   cancel  { i18n, text }  — cancel button label
//   danger  boolean         — red confirm button (default: false)
export function showConfirmModal({ title, body, confirm, cancel, danger = false } = {}) {
    return new Promise(resolve => {
        const el = document.createElement('div');
        el.className = 'confirm-modal-overlay';
        el.innerHTML = `
            <div class="confirm-modal" role="dialog" aria-modal="true">
                <h3 class="confirm-modal__title">${t(title)}</h3>
                <p  class="confirm-modal__body">${t(body)}</p>
                <div class="confirm-modal__actions">
                    <button type="button" class="btn confirm-modal__cancel">${t(cancel)}</button>
                    <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'} confirm-modal__confirm">${t(confirm)}</button>
                </div>
            </div>`;

        const close = (result) => {
            el.classList.add('confirm-modal-overlay--closing');
            el.addEventListener('animationend', () => { el.remove(); resolve(result); }, { once: true });
        };

        el.querySelector('.confirm-modal__confirm').addEventListener('click', () => close(true));
        el.querySelector('.confirm-modal__cancel').addEventListener('click',  () => close(false));
        el.addEventListener('click', e => { if (e.target === el) close(false); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(false); }, { once: true });

        document.body.appendChild(el);
    });
}
