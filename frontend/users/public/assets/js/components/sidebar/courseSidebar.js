import { t } from '../../services/i18n.js';
import { logMessage } from '../../services/logger.js';
import { coursePages, studentPages } from './sidebarItems.js';
import { fetchRequestData } from '../../utils/fetchData.js';

import { BACK_ARROW_SVG } from './sidebarIcons.js';
import {
    buildSidebarLogoHtml,
    buildSidebarNavHtml,
    buildSidebarStudentFooterHtml
} from './sidebarShared.js';

// ─── Text ─────────────────────────────────────────────
const TEXT = {
    sidebar: {
        myCourses : { i18n: '', text: 'My Courses'  },
        courseNav : { i18n: '', text: 'This Course'  },
    },
};

// Expected course shape:
// {
//   id            : number,
//   name          : string,
//   background_url: string | null,
//   progress_pct  : number,   // 0–100, from read_course (answered questions / total questions)
// }
function renderCourseSidebar(student = {}, course = {}, currentPage) {
    const courseId = course.id ?? null;
    const aside = document.querySelector('aside');
    if(!aside) return;

    const progress = course.progress_pct ?? 0;
    const { myCourses, courseNav } = TEXT.sidebar;

    aside.innerHTML = `
    <div class="course-sidebar-layout sidebar">
        ${buildSidebarLogoHtml()}
        <div class="course-sidebar-main">
            <div class="course-sidebar-course-section">
                <a href="student-courses.html">
                    ${BACK_ARROW_SVG}
                    <span data-i18n="${myCourses.i18n}">${t(myCourses)}</span>
                </a>
                <div class="course-sidebar-course-card">
                    <img src="${course.background_url ?? ''}" alt="course background">
                    <div class="course-sidebar-course-content">
                        <div class="course-sidebar-course-name">${course.name ?? ''}</div>
                        <div class="course-sidebar-progress-row">
                            <div class="course-sidebar-progress-bar">
                                <div class="course-sidebar-progress-fill" style="width:${progress}%;"></div>
                                <div class="course-sidebar-progress-track"></div>
                            </div>
                            <span class="course-sidebar-progress-text">${progress}%</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="course-sidebar-nav-section">
                <div class="course-sidebar-nav-title" data-i18n="${courseNav.i18n}">${t(courseNav)}</div>
                ${buildSidebarNavHtml(coursePages, currentPage, courseId)}
            </div>
        </div>

        <div class="course-sidebar-student-nav">
            ${buildSidebarNavHtml(studentPages, currentPage)}
        </div>

        ${buildSidebarStudentFooterHtml(student)}
    </div>`;
}

export async function mountCourseSidebar(course = {}, currentPage) {
    const request = { apiKey: 'read_student', requestData: {}, responseData: null };
    await fetchRequestData(request);
    const student = request.responseData?.data ?? {};
    renderCourseSidebar(student, course, currentPage);
}
