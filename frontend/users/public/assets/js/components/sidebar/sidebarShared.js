import { t } from '../../services/i18n.js';
import { BROWSE_COURSES_SVG } from './sidebarIcons.js';
import { renderAppLogo, renderAppLogoMark } from '../icons.js';
import { formatOrdinal } from '../../utils/format.js';
import { logMessage } from '../../services/logger.js';

export function buildSidebarLogoHtml() {
    return `
    <a href="home.html" class="sidebar-logo">
        <span class="sidebar-logo-full" aria-label="IMF AutoML">
            ${renderAppLogo({ variant: 'dark' })}
        </span>
        <span class="sidebar-logo-mark" aria-label="Q">
            ${renderAppLogoMark({ width: 32, height: 32 })}
        </span>
    </a>`;
}

export function buildSidebarNavHtml(pages, currentPage, courseId = null) {
    return `
    <ul class="sidebar-nav-list">
        ${pages.map((page) => {
            const href = (courseId != null) ? `${page.url}?course_id=${courseId}` : page.url;
            const active = currentPage === page.url;
            return `
            <li class="sidebar-nav-item">
                <a href="${href}" class="${active ? 'selected' : ''}">
                    ${page.icon}
                    <span class="sidebar-nav-label" data-i18n="${page.i18n}">
                        ${t(page)}
                    </span>
                </a>
            </li>`;
        }).join('')}
    </ul>`;
}

export function buildSidebarStudentFooterHtml(student = {}) {
    const year = student.year;
    const fullName = student.name;
    const subtitle = `${formatOrdinal(year)} Year ${student.speciality}`
    const initial = fullName.trim().charAt(0).toUpperCase();

    const browseCoursesLink = {i18n: '', text: 'Browse More Courses'};
    return `
    <div class="sidebar-student-footer">
        <div class="sidebar-student-link">
            <div class="sidebar-student-avatar">${initial}</div>

            <div class="sidebar-student-details">
                <div class="sidebar-student-name">${fullName}</div>
                <div class="sidebar-student-subtitle">${subtitle}</div>
            </div>
        </div>

        <a href="courses.html" class="sidebar-browse-courses-link">
            ${BROWSE_COURSES_SVG}
            <span class="sidebar-browse-courses-label" data-i18n="${browseCoursesLink.i18n}">${t(browseCoursesLink)}</span>
        </a>
    </div>`;
}
