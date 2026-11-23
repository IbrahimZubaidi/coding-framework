// ─── Constants ───────────────────────────────────────
const THEME_STORAGE_KEY = 'themeMode';

const MOON_SVG = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 2.25C8.1049 3.14511 7.60203 4.35913 7.60203 5.625C7.60203 6.89087 8.1049 8.10489 9 9C9.89511 9.89511 11.1091 10.398 12.375 10.398C13.6409 10.398 14.8549 9.89511 15.75 9C15.75 10.335 15.3541 11.6401 14.6124 12.7501C13.8707 13.8601 12.8165 14.7253 11.5831 15.2362C10.3497 15.7471 8.99252 15.8808 7.68314 15.6203C6.37377 15.3599 5.17104 14.717 4.22703 13.773C3.28303 12.829 2.64015 11.6262 2.3797 10.3169C2.11925 9.00749 2.25292 7.65029 2.76382 6.41689C3.27471 5.18349 4.13987 4.12928 5.2499 3.38758C6.35994 2.64588 7.66498 2.25 9 2.25Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

const SUN_SVG = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 1.5V3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 15V16.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.69727 3.69751L4.75477 4.75501" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.2451 13.245L14.3026 14.3025" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1.5 9H3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 9H16.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.75477 13.245L3.69727 14.3025" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14.3026 3.69751L13.2451 4.75501" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

// ─── Getters ─────────────────────────────────────────
export function getThemeMode() {
    return (localStorage.getItem(THEME_STORAGE_KEY) === 'dark') ? 'dark' : 'light';
}

export function getThemeIconHtml(mode = getThemeMode()) {
    return (mode === 'dark') ? MOON_SVG : SUN_SVG;
}

// ─── Apply ───────────────────────────────────────────
export function applyThemeMode(mode = getThemeMode()) {
    document.documentElement.setAttribute('data-theme', mode);
}

export function updateThemeToggleButtons(mode = getThemeMode()) {
    document.querySelectorAll('.theme-toggle-btn').forEach((button) => {
        button.innerHTML = getThemeIconHtml(mode);
    });
}

// ─── Init ────────────────────────────────────────────
export function initThemeMode() {
    const mode = getThemeMode();
    applyThemeMode(mode);
    updateThemeToggleButtons(mode);

    document.addEventListener('click', (e) => {
        const themeButton = e.target.closest('.theme-toggle-btn');
        if (!themeButton) return;

        const newMode = (getThemeMode() === 'dark' ? 'light' : 'dark');
        localStorage.setItem(THEME_STORAGE_KEY, newMode);
        applyThemeMode(newMode);
        updateThemeToggleButtons(newMode);
    });
}
