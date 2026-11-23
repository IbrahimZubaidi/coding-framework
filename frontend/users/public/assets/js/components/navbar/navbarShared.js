import { t } from '../../services/i18n.js';
import { getThemeIconHtml, getThemeMode } from '../../services/theme.js';
import { apiRequest } from '../../services/apiRequests.js';
import { logError, logMessage } from '../../services/logger.js';
import { DASHBOARD_SVG, SETTINGS_SVG, LOGOUT_SVG, DOWN_ARROW_SVG } from './navbarIcons.js';
import { showUserMessage } from '../atoms/message.js';
import { renderLanguageDropdown, initLanguageDropdown, renderCurrencyDropdown, initCurrencyDropdown } from './localeDropdowns.js';

let isLogoutHandlerInitialized = false;

// ─── Text ─────────────────────────────────────────────
const TEXT = {
    studentMenu: {
        dashboard : { i18n: '', text: 'Dashboard' },
        settings  : { i18n: '', text: 'Settings'  },
        logout    : { i18n: '', text: 'Logout'     },
    },
    errors: {
        logoutFailed : { i18n: '', text: 'Logout failed. Please try again.' },
    },
};

// ─── Locale & Currency Dropdowns ──────────────────────
export function renderLocaleDropdowns() {
    initLanguageDropdown();
    initCurrencyDropdown();
    return `
        <div class="navbar-locale-dropdowns">
            ${renderCurrencyDropdown()}
            ${renderLanguageDropdown()}
        </div>`;
}

// ─── Theme Toggle ─────────────────────────────────────
export function renderThemeToggleButton(mode = getThemeMode()) {
    return `
        <button class="theme-toggle-btn ghost-btn" type="button">
            ${getThemeIconHtml(mode)}
        </button>`;
}

// ─── Student Menu ─────────────────────────────────────
export function renderStudentMenu(student = {}) {
    const fullName  = student.name  ?? '';
    const firstName = fullName.split(' ')[0];
    const email     = student.email;
    const speciality = student.speciality_name;
    const initial   = firstName.charAt(0).toUpperCase();

    const menu = TEXT.studentMenu;
    initStudentLogout();
    return `
        <div class="student-dropdown dropdown">
            <button class="student-dropdown__toggle dropdown-toggle ghost-btn" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" type="button">
                <div class="student-avatar">${initial}</div>
                <div class="student-details">
                    <div class="student-name">${firstName}</div>
                    <div class="student-speciality">${speciality}</div>
                </div>
                <div class="dropdown-arrow">${DOWN_ARROW_SVG}</div>
            </button>
            <ul class="dropdown-menu">
                <li class="dropdown-item student-menu-header">
                    <div class="student-menu-name">${fullName}</div>
                    <div class="student-menu-email">${email}</div>
                </li>
                <li class="dropdown-item student-menu-item">
                    <a class="student-menu-link dashboard-link" href="student-dashboard.html">
                        ${DASHBOARD_SVG}
                        <span data-i18n="${menu.dashboard.i18n}">${t(menu.dashboard)}</span>
                    </a>
                </li>
                <li class="dropdown-item student-menu-item">
                    <a class="student-menu-link settings-link" href="student-profile.html">
                        ${SETTINGS_SVG}
                        <span data-i18n="${menu.settings.i18n}">${t(menu.settings)}</span>
                    </a>
                </li>
                <li class="dropdown-item student-menu-item">
                    <a class="student-menu-link logout-link" href="#">
                        ${LOGOUT_SVG}
                        <span data-i18n="${menu.logout.i18n}">${t(menu.logout)}</span>
                    </a>
                </li>
            </ul>
        </div>`;
}

// ─── Logout ───────────────────────────────────────────
function initStudentLogout() {
    if (isLogoutHandlerInitialized) return;
    isLogoutHandlerInitialized = true;

    document.addEventListener('click', async (e) => {
        const logoutLink = e.target.closest('.logout-link');
        if (!logoutLink) return;

        e.preventDefault();
        try {
            const response = await apiRequest('logout');
            if (!response?.ok) {
                showUserMessage({ message: TEXT.errors.logoutFailed });
                return;
            }
            window.location.href = 'login.html';
        } catch (error) {
            logError('Logout failed:', error);
            showUserMessage({ status: 'error', message: TEXT.errors.logoutFailed });
        }
    });
}
