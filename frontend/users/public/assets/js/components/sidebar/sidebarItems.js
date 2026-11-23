import {
    STUDENT_DASHBOARD_ICON_SVG,
    STUDENT_COURSES_ICON_SVG,
    STUDENT_TRANSACTIONS_ICON_SVG,
    STUDENT_PROFILE_ICON_SVG,
    COURSE_OVERVIEW_ICON_SVG,
    COURSE_SESSIONS_ICON_SVG,
    COURSE_EXAMS_ICON_SVG,
    COURSE_STUDY_ICON_SVG
} from './sidebarIcons.js';

// ─── Student Pages ────────────────────────────────────
export const studentPages = [{
        url: 'student-dashboard.html',
        i18n: '', text: 'Dashboard',
        icon: STUDENT_DASHBOARD_ICON_SVG
    }, {
        url: 'student-courses.html',
        i18n: '', text: 'My Courses',
        icon: STUDENT_COURSES_ICON_SVG
    }, {
        url: 'student-transactions.html',
        i18n: '', text: 'My Transactions',
        icon: STUDENT_TRANSACTIONS_ICON_SVG
    }, {
        url: 'student-profile.html',
        i18n: '', text: 'Profile',
        icon: STUDENT_PROFILE_ICON_SVG
}];

// ─── Course Pages ─────────────────────────────────────
export const coursePages = [{
        url: 'course-overview.html',
        i18n: '', text: 'Course Overview',
        icon: COURSE_OVERVIEW_ICON_SVG
    }, {
        url: 'course-sessions.html',
        i18n: '', text: 'Sessions',
        icon: COURSE_SESSIONS_ICON_SVG
    }, {
        url: 'course-exams.html',
        i18n: '', text: 'Exams',
        icon: COURSE_EXAMS_ICON_SVG
    }, {
        url: 'course-study.html',
        i18n: '', text: 'Study Mode',
        icon: COURSE_STUDY_ICON_SVG
}];
