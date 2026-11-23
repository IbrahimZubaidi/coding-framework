import { t } from '../../services/i18n.js';

const DEFAULT_LOCATION = 'top';
const DEFAULT_STATUS = 'error';
const DEFAULT_DURATION = 4;
const MIN_DURATION = 1;
const MAX_DURATION = 10;

const SUPPORTED_LOCATIONS = new Set([
    'top',
    'top-right',
    'top-left',
    'bottom',
    'bottom-right',
    'bottom-left',
    'right',
    'left'
]);

// ─── Defaults ────────────────────────────────────────
const DEFAULT_MESSAGES = {
    success: { i18n: '', text: 'Action completed successfully.'          },
    error:   { i18n: '', text: 'Something went wrong. Please try again.' },
    warning: { i18n: '', text: 'Please review this before continuing.'   },
    muted:   { i18n: '', text: 'Here is an update for you.'              }
};

const STATUS_ICONS = {
    success: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
            <path d="M16.5 8.5 10.5 14.5 7.5 11.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`,
    error: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
            <path d="M12 8v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <path d="M12 16h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>`,
    warning: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 2 21h20L12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
            <path d="M12 9v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <path d="M12 17h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>`,
    muted: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
            <path d="M12 12h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <path d="M12 8v1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>`
};

// ─── Helpers ─────────────────────────────────────────
function getMessageLocation(location) {
    return SUPPORTED_LOCATIONS.has(location) ? location : DEFAULT_LOCATION;
}

function getMessageStatus(status) {
    return DEFAULT_MESSAGES[status] ? status : DEFAULT_STATUS;
}

// Returns the message label — caller's or the default for this status.
function resolveMessage(status, message) {
    return (message?.text !== undefined) ? message : DEFAULT_MESSAGES[status];
}

function getMessageDuration(duration) {
    if (duration == null) return DEFAULT_DURATION;
    if (typeof duration === 'string' && duration.trim() === '') return DEFAULT_DURATION;

    const value = Number(duration);
    if (!Number.isFinite(value)) return DEFAULT_DURATION;

    return Math.max(MIN_DURATION, Math.min(MAX_DURATION, value));
}

function getMessageContainer(location) {
    const locationClass = `user-message-container--${location}`;
    let container = document.querySelector(`.${locationClass}`);

    if (container) return container;

    document.body.insertAdjacentHTML(
        'beforeend',
        `<div class="user-message-container ${locationClass}"></div>`
    );

    return document.querySelector(`.${locationClass}`);
}

function removeMessage(messageElement) {
    if (!messageElement || messageElement.classList.contains('is-closing')) return;

    messageElement.classList.add('is-closing');
    messageElement.addEventListener('animationend', () => {
        messageElement.remove();
    }, { once: true });
}

// ─── Show ────────────────────────────────────────────
// message: { i18n: '', text: '...' } — caller provides both fields.
// Falls back to DEFAULT_MESSAGES[status] if not provided.
export function showUserMessage({
    location = DEFAULT_LOCATION,
    status   = DEFAULT_STATUS,
    message  = null,
    duration = DEFAULT_DURATION
} = {}) {
    const finalLocation   = getMessageLocation(location);
    const finalStatus     = getMessageStatus(status);
    const finalMessage    = resolveMessage(finalStatus, message);
    const finalDuration   = getMessageDuration(duration);
    const finalDurationMs = finalDuration * 1000;

    const container = getMessageContainer(finalLocation);
    container.insertAdjacentHTML(
        'beforeend',
        `
        <div class="user-message user-message--${finalStatus} user-message--${finalLocation}">
            <div class="user-message__content">
                <div class="user-message__icon">${STATUS_ICONS[finalStatus]}</div>
                <div class="user-message__text" data-i18n="${finalMessage.i18n}">${t(finalMessage)}</div>
                <button class="user-message__close" type="button">&times;</button>
            </div>
            <div class="user-message__progress">
                <div class="user-message__progress-bar"></div>
            </div>
        </div>
        `
    );

    const messageElement = container.lastElementChild;
    const closeButton    = messageElement.querySelector('.user-message__close');
    const progressBar    = messageElement.querySelector('.user-message__progress-bar');

    const removeTimeout = window.setTimeout(() => {
        removeMessage(messageElement);
    }, finalDurationMs);

    closeButton.addEventListener('click', () => {
        window.clearTimeout(removeTimeout);
        removeMessage(messageElement);
    });

    progressBar.style.width = '100%';
    progressBar.style.transition = `width ${finalDurationMs}ms linear`;
    progressBar.getBoundingClientRect();

    window.requestAnimationFrame(() => {
        progressBar.style.width = '0%';
    });

    return messageElement;
}
