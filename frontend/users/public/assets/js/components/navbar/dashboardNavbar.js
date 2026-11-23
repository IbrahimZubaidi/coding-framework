import { getThemeMode } from '../../services/theme.js';
import { renderStudentMenu, renderThemeToggleButton, renderLocaleDropdowns } from './navbarShared.js';
import { renderNotificationsMenu } from './notificationsDropdown.js';
import { fetchRequestData } from '../../utils/fetchData.js';

function renderDashboardNavbar(student = {}, mode = getThemeMode()) {
    const header = document.querySelector('header');
    if(!header) return;

    header.innerHTML = `
    <nav class="navbar dashboard-navbar">
        <div class="navbar-content dashboard-navbar-content">
            ${renderThemeToggleButton(mode)}
            ${renderNotificationsMenu()}
            ${renderLocaleDropdowns()}
            ${renderStudentMenu(student)}
        </div>
    </nav>`;
}

export async function mountDashboardNavbar(mode = getThemeMode()) {
    // TODO: uncomment API call when backend is ready
    // const request = { apiKey: 'read_student', requestData: {}, responseData: null };
    // await fetchRequestData(request);
    // const student = request.responseData?.data ?? {};

    // Use fake data for now
    const student = {
        name: 'John Doe',
        email: 'john@example.com',
        speciality_name: 'Computer Science'
    };

    renderDashboardNavbar(student, mode);
}
