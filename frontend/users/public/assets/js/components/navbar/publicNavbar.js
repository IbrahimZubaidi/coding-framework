import { t } from '../../services/i18n.js';
import { renderStudentMenu, renderThemeToggleButton } from './navbarShared.js';
import { renderNotificationsMenu } from './notificationsDropdown.js';
import { BURGER_OPEN_SVG, BURGER_CLOSE_SVG } from './navbarIcons.js';
import { renderAppLogo } from '../icons.js';
import { fetchRequestData } from '../../utils/fetchData.js';

let isPublicNavbarInitialized = false;

// ─── Text ─────────────────────────────────────────────
const TEXT = {
    nav: [
        { url: 'courses.html',    i18n: '', text: 'Browse Courses' },
        { url: 'blogs.html',      i18n: '', text: 'Blogs'          },
        { url: 'about-us.html',   i18n: '', text: 'About Us'       },
        { url: 'contact-us.html', i18n: '', text: 'Contact Us'     },
    ],
    auth: {
        signIn     : { i18n: '', text: 'Sign In'     },
        getStarted : { i18n: '', text: 'Get Started' },
    },
};

// ─── Renderers ───────────────────────────────────────
function buildNavBarNavHtml(pages, currentPageName) {
    return `
    <ul class="public-navbar__nav-list">
        ${pages.map(page => `
            <li class="public-navbar__nav-item">
                <a href="${page.url}" class="${currentPageName == page.url ? 'active' : ''}" data-i18n="${page.i18n}">
                    ${t(page)}
                </a>
            </li>
        `).join('')}
    </ul>`;
}

function renderPublicNavbar(student = {}, mode, currentPageName) {
    const header = document.querySelector('header');
    if (!header) return;
    const hasStudent = !Boolean(student?.name);

    header.innerHTML = `
    <nav class="navbar public-navbar">
        <a href="home.html" class="public-navbar__brand">
            ${renderAppLogo({ variant: 'dark' })}
        </a>

        ${renderThemeToggleButton(mode)}
        ${!hasStudent ? renderNotificationsMenu() : ``}
        <button
            class="public-navbar__burger ghost-btn"
            aria-expanded="false"
            aria-controls="publicNavbarMenu"
            type="button">
            ${BURGER_OPEN_SVG}
        </button>
        <div id="publicNavbarMenu" class="navbar-content public-navbar__menu">
            <div class="public-navbar__menu-spacer" aria-hidden="true"></div>
            <div class="public-navbar__nav-wrap">
                ${buildNavBarNavHtml(TEXT.nav, currentPageName)}
            </div>

            <div class="public-navbar__actions">
                ${!hasStudent ? renderStudentMenu(student) : `
                <div class="public-navbar__auth-links">
                    <a class="signin-btn btn btn--dark" href="login.html" data-i18n="${TEXT.auth.signIn.i18n}">${t(TEXT.auth.signIn)}</a>
                    <a class="register-btn btn" href="register.html" data-i18n="${TEXT.auth.getStarted.i18n}">${t(TEXT.auth.getStarted)}</a>
                </div>`}
            </div>
        </div>
    </nav>`;
}

// ─── Init ────────────────────────────────────────────
function initPublicNavbar() {
    if (isPublicNavbarInitialized) return;
    isPublicNavbarInitialized = true;

    document.addEventListener('click', (e) => {
        const navbar = document.querySelector('.public-navbar');
        const burger = e.target.closest('.public-navbar__burger');
        const clickedInsideNavbar = e.composedPath().includes(navbar);

        if (!navbar) return;

        if (burger) {
            const isOpen = navbar.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', String(isOpen));
            burger.innerHTML = isOpen ? BURGER_CLOSE_SVG : BURGER_OPEN_SVG;
            return;
        }

        if (!navbar.classList.contains('is-open') || clickedInsideNavbar) return;

        const openBurger = navbar.querySelector('.public-navbar__burger');
        navbar.classList.remove('is-open');

        if (openBurger) {
            openBurger.setAttribute('aria-expanded', 'false');
            openBurger.innerHTML = BURGER_OPEN_SVG;
        }
    });
}

// ─── Mount ───────────────────────────────────────────
export async function mountPublicNavbar(mode, currentPageName) {
    const request = { apiKey: 'read_student', requestData: {}, responseData: null };
    await fetchRequestData(request);
    const student = request.responseData?.data ?? {};
    renderPublicNavbar(student, mode, currentPageName);
    initPublicNavbar();
}
