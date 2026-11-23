// ─── Course ──────────────────────────────────────────
const COURSE_KEY = 'current_course';

export function saveCourse(course) {
    sessionStorage.setItem(COURSE_KEY, JSON.stringify(course));
}

export function getCourse() {
    const value = sessionStorage.getItem(COURSE_KEY);
    return value ? JSON.parse(value) : null;
}

export function clearCourse() {
    sessionStorage.removeItem(COURSE_KEY);
}
