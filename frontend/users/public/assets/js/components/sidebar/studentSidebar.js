import { t } from '../../services/i18n.js';
import { studentPages } from './sidebarItems.js';
import {
    buildSidebarLogoHtml,
    buildSidebarNavHtml,
    buildSidebarStudentFooterHtml
} from './sidebarShared.js';
import { fetchRequestData } from '../../utils/fetchData.js';

function renderStudentSidebar(student = {}, currentPage) {
    const aside = document.querySelector('aside');
    if(!aside) return;

    const navTitle = { i18n: '', text: 'Navigation' };

    aside.innerHTML = `
    <div class="student-sidebar-layout sidebar">
        ${buildSidebarLogoHtml()}

        <div class="student-sidebar-main">
            <div class="student-sidebar-nav-section">
                <div class="student-sidebar-nav-title" data-i18n="${navTitle.i18n}">${t(navTitle)}</div>
            </div>
            ${buildSidebarNavHtml(studentPages, currentPage)}
        </div>

        ${buildSidebarStudentFooterHtml(student)}
    </div>`;
}

export async function mountStudentSidebar(currentPage) {
    // TODO: uncomment API call when backend is ready
    // const request = { apiKey: 'read_student', requestData: {}, responseData: null };
    // await fetchRequestData(request);
    // const student = request.responseData?.data ?? {};

    // Use fake data for now
    const student = {
        name: 'John Doe',
        year: 3,
        speciality: 'Computer Science'
    };

    renderStudentSidebar(student, currentPage);
}