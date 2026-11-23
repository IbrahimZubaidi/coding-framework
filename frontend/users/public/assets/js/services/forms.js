import { apiRequest } from '../services/apiRequests.js';
import { showUserMessage } from '../components/atoms/message.js';
import { setButtonLoading, clearButtonLoading } from '../components/atoms/loading.js';
import { t } from '../services/i18n.js';

// ─── Messages ────────────────────────────────────────
const errors = {
    submit        : { i18n: '', text: 'Something went wrong. Please try again.' },
};

const validationMessages = {
    required      : { i18n: '', text: 'is required.'                    },
    email         : { i18n: '', text: 'must be a valid email address.'   },
    url           : { i18n: '', text: 'must be a valid URL.'             },
    number        : { i18n: '', text: 'must be a number.'                },
    lengthBetween : { i18n: '', text: 'must be between {min} and {max} characters.' },
    lengthMin     : { i18n: '', text: 'must be at least {min} characters.'          },
    lengthMax     : { i18n: '', text: 'must be at most {max} characters.'           },
    rangeBetween  : { i18n: '', text: 'must be between {min} and {max}.' },
    rangeMin      : { i18n: '', text: 'must be at least {min}.'          },
    rangeMax      : { i18n: '', text: 'must be at most {max}.'           },
    pattern       : { i18n: '', text: 'format is invalid.'               },
};

// ─── Label Resolution ────────────────────────────────
// Returns { i18n, text } — i18n taken from the DOM label's data-i18n attribute.
function getLabel(input) {
    const labelEl = input.id ? document.querySelector(`label[for="${input.id}"]`) : null;
    const raw = labelEl?.textContent?.trim() || input.name || 'Field';
    const text = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/-|_/g, ' ');
    return { i18n: labelEl?.dataset?.i18n || '', text };
}

// ─── Error HTML ──────────────────────────────────────
// Builds a two-span string: label (translatable) + static message (translatable).
// Numeric placeholders ({min}, {max}) are interpolated into the translated message text.
function buildError(label, msg, vars = {}) {
    let msgText = t(msg);
    for (const [k, v] of Object.entries(vars)) msgText = msgText.replace(`{${k}}`, v);
    return `<span data-i18n="${label.i18n}">${t(label)}</span> <span data-i18n="${msg.i18n}">${msgText}</span>`;
}

// ─── Validators ──────────────────────────────────────
function validateRequired(value, label) {
    if (value.trim() === '') return buildError(label, validationMessages.required);
    return null;
}

function validateType(value, type, label) {
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return buildError(label, validationMessages.email);
    if (type === 'url' && !/^https?:\/\/.+/.test(value))
        return buildError(label, validationMessages.url);
    if (type === 'number' && isNaN(Number(value)))
        return buildError(label, validationMessages.number);
    return null;
}

function validateLength(value, input, label) {
    const min = input.minLength > 0 ? input.minLength : null;
    const max = input.maxLength > 0 && input.maxLength < 524288 ? input.maxLength : null;
    const len = value.length;

    if (min && max && (len < min || len > max)) return buildError(label, validationMessages.lengthBetween, { min, max });
    if (min && len < min) return buildError(label, validationMessages.lengthMin, { min });
    if (max && len > max) return buildError(label, validationMessages.lengthMax, { max });
    return null;
}

function validateRange(value, input, label) {
    const min = input.min !== '' ? Number(input.min) : null;
    const max = input.max !== '' ? Number(input.max) : null;
    const num = Number(value);

    if (min !== null && max !== null && (num < min || num > max)) return buildError(label, validationMessages.rangeBetween, { min, max });
    if (min !== null && num < min) return buildError(label, validationMessages.rangeMin, { min });
    if (max !== null && num > max) return buildError(label, validationMessages.rangeMax, { max });
    return null;
}

function validatePattern(value, input, label) {
    if (input.pattern && !new RegExp(`^(?:${input.pattern})$`).test(value))
        return input.title || buildError(label, validationMessages.pattern);
    return null;
}

// ─── Core ────────────────────────────────────────────
// · Validation

function validateInput(input) {
    const value = input.value ?? '';
    const label = getLabel(input);

    if (input.required) {
        const error = validateRequired(value, label);
        if (error) return error;
    }

    if (!value.trim()) return null;

    return (
        validateType(value, input.type, label) ||
        validateLength(value, input, label)    ||
        validateRange(value, input, label)     ||
        validatePattern(value, input, label)   ||
        null
    );
}

function showInputError(input, message) {
    input.classList.add('is-invalid');
    let el = input.parentElement.querySelector(':scope > .form-field-error');
    if (!el) {
        el = document.createElement('span');
        el.className = 'form-field-error';
        input.after(el);
    }
    el.innerHTML = message;
}

function clearInputError(input) {
    input.classList.remove('is-invalid');
    const el = input.parentElement.querySelector(':scope > .form-field-error');
    if (el) el.innerHTML = '';
}

function validateForm(form) {
    let valid = true;
    form.querySelectorAll('input, textarea, select').forEach(input => {
        const error = validateInput(input);
        if (error) { showInputError(input, error); valid = false; }
        else clearInputError(input);
    });
    return valid;
}

// · Data

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

async function getFormData(form) {
    const data = {};
    const promises = [];
    new FormData(form).forEach((value, key) => {
        if (value instanceof File && value.type.startsWith('image/')) {
            promises.push(fileToBase64(value).then(b64 => { data[key] = b64; }));
        } else {
            data[key] = value;
        }
    });
    await Promise.all(promises);
    return data;
}

// · Submit — pattern: submit-then-inline (recommended)

async function handleSubmit(form) {
    if (!validateForm(form)) return;

    const apiKey = form.dataset.api;
    if (!apiKey) return;

    const submitBtn = form.querySelector('[type="submit"]');
    setButtonLoading(submitBtn);

    try {
        const response = await apiRequest(apiKey, { data: await getFormData(form) });

        if (!response.ok) {
            const raw = response.data?.detail || response.data?.message || null;
            const message = raw ? { i18n: '', text: raw } : errors.submit;
            showUserMessage({ status: 'error', message });
            form.dispatchEvent(new CustomEvent('form:error', { detail: { response } }));
            return;
        }

        form.dispatchEvent(new CustomEvent('form:success', { detail: { response } }));

    } finally {
        clearButtonLoading(submitBtn);
    }
}

// ─── Init ────────────────────────────────────────────
// Call once globally. Each page listens to form:success / form:error as needed.
export function initForms(selector = 'form[data-api]') {
    document.querySelectorAll(selector).forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            handleSubmit(form);
        });

        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', () => {
                const error = validateInput(input);
                if (error) showInputError(input, error);
                else clearInputError(input);
            });
        });
    });
}
