// ─── Student ─────────────────────────────────────────
const STUDENT_KEY = 'student_user';

export function saveStudent(student) {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
}

export function getStudent() {
    const value = localStorage.getItem(STUDENT_KEY);
    return value ? JSON.parse(value) : null;
}

export function clearStudent() {
    localStorage.removeItem(STUDENT_KEY);
}
