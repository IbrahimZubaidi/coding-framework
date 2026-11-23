import { logError, logGroup, logGroupEnd, logMessage } from './logger.js';

// ─── Config ──────────────────────────────────────────
// Stores path + method only. Full URL is built lazily in buildApiRequest
// so APP_CONFIG is guaranteed to be loaded before it's read.
function createApiConfig(path, method = 'GET') {
    return { path, method };
}

// ─── API Map ─────────────────────────────────────────
export const STUDENT_API_MAP = {
    // Account
    read_student: createApiConfig('/me'),
    update_profile: createApiConfig('/update-profile', 'PATCH'),
    update_password: createApiConfig('/update-password', 'PATCH'),

    // Auth
    register: createApiConfig('/register', 'POST'),
    login: createApiConfig('/login', 'POST'),
    logout: createApiConfig('/logout', 'POST'),

    // Notifications
    read_notifications: createApiConfig('/notifications'),
    update_notifications_seen: createApiConfig('/notifications/seen', 'PATCH'),

    // Blogs
    read_blogs: createApiConfig('/blogs'),
    read_blog: createApiConfig('/blogs/{blog_id}'),
    read_categories: createApiConfig('/categories'),
    read_universities: createApiConfig('/universities'),
    read_specialities: createApiConfig('/specialities'),

    // Courses
    read_courses: createApiConfig('/courses'),
    read_course: createApiConfig('/courses/{course_id}'),
    read_course_subjects: createApiConfig('/courses/{course_id}/subjects'),
    read_course_questions: createApiConfig('/courses/{course_id}/questions'),
    read_course_questions_count: createApiConfig('/courses/{course_id}/questions/count'),
    read_course_packages: createApiConfig('/courses/{course_id}/packages'),
    read_subscribed_courses: createApiConfig('/courses/subscribed/'),

    // Questions / subjects / packages
    read_subject_questions: createApiConfig('/subjects/{subject_id}/questions'),
    read_package: createApiConfig('/packages/{package_id}'),

    // Transactions
    create_transaction: createApiConfig('/transactions', 'POST'),
    read_transactions: createApiConfig('/transactions'),
    read_transaction: createApiConfig('/transactions/{transaction_id}'),
    read_offer: createApiConfig('/transactions/offer'),
    read_transaction_quote: createApiConfig('/transactions/quote'),
    update_transaction_cancel: createApiConfig('/transactions/{transaction_id}', 'PATCH'),

    // Sessions
    create_session: createApiConfig('/courses/{course_id}/sessions', 'POST'),
    read_sessions: createApiConfig('/courses/{course_id}/sessions'),
    read_session: createApiConfig('/sessions/{session_id}'),
    read_session_questions: createApiConfig('/sessions/{session_id}/questions'),
    read_session_question: createApiConfig('/sessions/{session_id}/questions/{question_id}'),
    update_session_question_note: createApiConfig('/sessions/{session_id}/questions/{question_id}/note', 'PATCH'),
    update_session_question_flag: createApiConfig('/sessions/{session_id}/questions/{question_id}/flag', 'PATCH'),
    update_session_question_answer: createApiConfig('/sessions/{session_id}/questions/{question_id}/answer', 'PATCH'),
    delete_session: createApiConfig('/sessions/{session_id}', 'DELETE'),
    delete_sessions: createApiConfig('/sessions', 'DELETE'),

    // Exams
    create_exam: createApiConfig('/courses/{course_id}/exams', 'POST'),
    read_exams: createApiConfig('/courses/{course_id}/exams'),
    read_exam: createApiConfig('/exams/{exam_id}'),
    read_exam_questions: createApiConfig('/exams/{exam_id}/questions'),
    read_exam_question: createApiConfig('/exams/{exam_id}/questions/{question_id}'),
    update_exam_submit: createApiConfig('/exams/{exam_id}', 'PATCH'),
    update_exam_question_flag: createApiConfig('/exams/{exam_id}/questions/{question_id}/flag', 'PATCH'),
    update_exam_question_answer: createApiConfig('/exams/{exam_id}/questions/{question_id}/answer', 'PATCH'),
    delete_exam: createApiConfig('/exams/{exam_id}', 'DELETE'),
    delete_exams: createApiConfig('/exams', 'DELETE'),

    // KPIs
    read_public_kpis:   createApiConfig('/kpis/public'),
    read_dashboard_kpis: createApiConfig('/kpis/dashboard'),
    read_course_kpis:   createApiConfig('/courses/{course_id}/kpis'),

    // Contact
    create_contact: createApiConfig('/contact', 'POST'),
};

// ─── URL Resolution ──────────────────────────────────
// Replaces placeholders like {course_id} in a mapped API URL.
export function resolveApiUrl(url, params = {}) {
    return url.replace(/\{(\w+)\}/g, (match, key) => {
        const value = params[key];
        return value === undefined || value === null ? match : encodeURIComponent(value);
    });
}

// Returns a ready-to-use request config from the map.
// URL is built here so APP_CONFIG is read after all scripts have loaded.
export function buildApiRequest(apiKey, { params = {}, data = null } = {}) {
    const apiConfig = STUDENT_API_MAP[apiKey];

    if (!apiConfig) {
        throw new Error(`Unknown API key: ${apiKey}`);
    }

    const url = resolveApiUrl(`${window.APP_CONFIG.apiBaseUrl}${apiConfig.path}`, params);
    return { url, method: apiConfig.method, data };
}

// ─── Request Builder ─────────────────────────────────
function buildUrl(url, params = null) {
    const finalUrl = new URL(url, window.location.origin);

    if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            if (Array.isArray(value)) {
                value.forEach(item => finalUrl.searchParams.append(key, item));
                return;
            }

            finalUrl.searchParams.append(key, value);
        });
    }

    return finalUrl.toString();
}

async function parseResponse(response) {
    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    if (!text) return null;

    if (contentType.includes('application/json')) {
        return JSON.parse(text);
    }

    if (
        contentType.includes('text/') ||
        contentType.includes('application/xml') ||
        contentType.includes('application/xhtml+xml')
    ) {
        return text;
    }

    return text;
}

// ─── Request ─────────────────────────────────────────
export async function apiRequest(apiKey, options = {}) {
    const { url, method = 'GET', data = null } = buildApiRequest(apiKey, options);

    const upperMethod = method.toUpperCase();
    const isQueryMethod = upperMethod === 'GET' || upperMethod === 'HEAD';
    const finalUrl = isQueryMethod ? buildUrl(url, data) : buildUrl(url);
    const requestOptions = {
        method: upperMethod,
        credentials: 'include'
    };

    if (!isQueryMethod && data !== null && data !== undefined) {
        requestOptions.headers = {
            'Content-Type': 'application/json'
        };
        requestOptions.body = JSON.stringify(data);
    }

    logGroup(`API Request: ${upperMethod} ${finalUrl}`, true, 'orange');
    logMessage('Final URL:',     finalUrl,        'orange');
    logMessage('Method:',        upperMethod,     'orange');
    logMessage('Data:',          data,            'orange');
    logMessage('Fetch Options:', requestOptions,  'orange');
    logGroupEnd();

    try {
        const response = await fetch(finalUrl, requestOptions);
        const responseData = await parseResponse(response);

        const statusColor = response.status < 300 ? 'green' : response.status < 500 ? 'yellow' : 'red';
        logGroup(`API Response: ${upperMethod} ${finalUrl} [${response.status}]`, true, statusColor);
        logMessage('Status:',           response.status,                                statusColor);
        logMessage('OK:',               response.ok,                                    statusColor);
        logMessage('Response Headers:', Object.fromEntries(response.headers.entries()), statusColor);
        logMessage('Response Data:',    responseData,                                   statusColor);
        logGroupEnd();

        return {
            ok: response.ok,
            status: response.status,
            data: responseData
        };
    } catch (error) {
        logGroup(`API Error: ${upperMethod} ${finalUrl}`, true, 'red');
        logError('Error:', error);
        logGroupEnd();
        throw error;
    }
}
