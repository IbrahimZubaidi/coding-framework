// ─── Password Toggle ─────────────────────────────────
// Renders the toggle button HTML — drop inside any .form-field__input-wrap.
export function renderPasswordToggle() {
    return `
        <button type="button" class="password-toggle">
            <svg class="eye-icon eye-icon--show" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <svg class="eye-icon eye-icon--hide" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path><path d="m2 2 20 20"></path></svg>
        </button>`;
}

// Initialises toggle behaviour via document-level delegation.
// Call once per page — handles all .password-toggle buttons globally.
export function initPasswordToggle() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.password-toggle');
        if (!btn) return;

        const input = btn.parentElement.querySelector('input[type="password"], input[type="text"]');
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.classList.toggle('is-visible', isHidden);
    });
}

// ─── Auth Redirects ──────────────────────────────────
// Returns the raw (still-encoded) `next` param from the current URL, or null.
export function getNextParam() {
    return new URLSearchParams(window.location.search).get('next');
}

// Redirects to the login page, embedding the current full URL as a `next` param.
export function redirectToLogin() {
    const next = encodeURIComponent(window.location.href);
    window.location.href = `login.html?next=${next}`;
}

// After a successful login or signup, redirects to the `next` URL param (fallback: home.html).
export function redirectAfterAuth() {
    const next = getNextParam();
    window.location.href = next ? decodeURIComponent(next) : 'home.html';
}
