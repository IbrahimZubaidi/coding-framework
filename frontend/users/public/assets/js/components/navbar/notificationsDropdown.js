import { t } from '../../services/i18n.js';
import { cachedApiRequest } from '../../services/cache.js';
import { apiRequest } from '../../services/apiRequests.js';
import { logError } from '../../services/logger.js';
import { getLoadingHtml } from '../atoms/loading.js';
import { showUserMessage } from '../atoms/message.js';
import { formatRelativeTime } from '../../utils/helpers.js';
import { BELL_SVG } from './navbarIcons.js';

// ─── API Requests ────────────────────────────────────
// notifications    — cached with TTL; re-uses response on repeat bell clicks
// notificationsAll — fresh: true; always fetches latest when user clicks "view all"
const apiRequests = {
    notifications    : { apiKey: 'read_notifications', requestData: { page: 1, limit: 5 }, params: null, ttl: 60_000 },
    notificationsAll : { apiKey: 'read_notifications', requestData: { page: 1 },           params: null, fresh: true  },
};

let isNotificationsHandlerInitialized = false;
let notificationsState = {
    notifications: [],
    pagination: {},
    isShowingAll: false,
    isFetched: false    // tracks if API was called, regardless of results
};

// ─── Text ─────────────────────────────────────────────
const TEXT = {
    menu: {
        header: {
            title   : { i18n: '', text: 'Notifications' },
            markAll : { i18n: '', text: 'Mark all read'  },
        },
        subtitle: {
            one  : { i18n: '', text: 'unread notification'  },
            many : { i18n: '', text: 'unread notifications' },
        },
        empty: {
            title : { i18n: '', text: 'No notifications'    },
            body  : { i18n: '', text: "You're all caught up." },
        },
        footer: {
            viewAll : { i18n: '', text: 'View all notifications' },
        },
    },
    errors: {
        loadFailed    : { i18n: '', text: 'Failed to load notifications. Please try again.'         },
        loadAllFailed : { i18n: '', text: 'Failed to load all notifications. Please try again.'     },
        markFailed    : { i18n: '', text: 'Failed to mark notifications as read. Please try again.' },
    },
};

// ─── Render ──────────────────────────────────────────
export function renderNotificationsMenu(hasNotifications = false) {
    initNotificationsDropdown();

    return `
        <div class="notification-dropdown dropdown">
            <button class="notification-dropdown__toggle dropdown-toggle ghost-btn ${hasNotifications ? 'active' : ''}" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" type="button">
                ${BELL_SVG}
            </button>
            <ul class="dropdown-menu">
                ${getLoadingHtml()}
            </ul>
        </div>`;
}

function renderNotificationsDropdownMenu(notifications = [], pagination = {}) {
    const unreadCount = notifications.filter((n) => !n.is_seen).length;
    const totalCount  = pagination.total_rows ?? notifications.length;
    const hasNextPage = Boolean(pagination.has_next_page);

    const menu = TEXT.menu;
    const subtitle = unreadCount === 1 ? menu.subtitle.one : menu.subtitle.many;

    const items = notifications.length
        ? notifications.map((n) => `
            <li class="notification-menu__item ${!n.is_seen ? 'is-unread' : ''}">
                <div class="notification-menu__item-head">
                    <div class="notification-menu__item-title">${n.title}</div>
                    ${!n.is_seen ? '<span class="notification-menu__item-dot"></span>' : ''}
                </div>
                <div class="notification-menu__item-body">${n.body}</div>
                <div class="notification-menu__item-time">${formatRelativeTime(n.created_at)}</div>
            </li>`).join('')
        : `
            <li class="notification-menu__item is-empty">
                <div class="notification-menu__item-title" data-i18n="${menu.empty.title.i18n}">${t(menu.empty.title)}</div>
                <div class="notification-menu__item-body"  data-i18n="${menu.empty.body.i18n}">${t(menu.empty.body)}</div>
            </li>`;

    return `
        <div class="notification-menu">
            <div class="notification-menu__header">
                <div class="notification-menu__copy">
                    <div class="notification-menu__title" data-i18n="${menu.header.title.i18n}">${t(menu.header.title)}</div>
                    <div class="notification-menu__subtitle">
                        <span>${unreadCount}</span>
                        <span data-i18n="${subtitle.i18n}">${t(subtitle)}</span>
                    </div>
                </div>
                <button class="notification-menu__action btn-nan" type="button" data-i18n="${menu.header.markAll.i18n}">${t(menu.header.markAll)}</button>
            </div>
            <ul class="notification-menu__list">${items}</ul>
            <div class="notification-menu__footer">
                <button class="notification-menu__footer-btn btn-nan" type="button" ${hasNextPage ? '' : 'disabled'}>
                    <span class="notification-menu__footer-label">
                        <span data-i18n="${menu.footer.viewAll.i18n}">${t(menu.footer.viewAll)}</span>
                        <span>(${totalCount})</span>
                    </span>
                </button>
            </div>
        </div>`;
}

// ─── Init ────────────────────────────────────────────
function initNotificationsDropdown() {
    if (isNotificationsHandlerInitialized) return;
    isNotificationsHandlerInitialized = true;

    document.addEventListener('click', async (e) => {
        const markAllButton = e.target.closest('.notification-menu__action');
        if (markAllButton) {
            e.preventDefault();
            await markAllNotificationsAsRead(markAllButton.closest('.dropdown-menu'));
            return;
        }

        const viewAllButton = e.target.closest('.notification-menu__footer-btn');
        if (viewAllButton) {
            e.preventDefault();
            await showAllNotifications(viewAllButton.closest('.dropdown-menu'));
            return;
        }

        const notificationsToggle = e.target.closest('.notification-dropdown__toggle');
        if (!notificationsToggle) return;
        if (notificationsToggle.getAttribute('aria-expanded') === 'false') return;

        try {
            const dropdownMenu = notificationsToggle.closest('.notification-dropdown')?.querySelector('.dropdown-menu');
            if (!dropdownMenu) return;

            // use cached state on subsequent clicks, even if notifications list is empty
            if (notificationsState.isFetched) {
                dropdownMenu.innerHTML = renderNotificationsDropdownMenu(
                    notificationsState.notifications,
                    notificationsState.pagination
                );
                return;
            }

            const req = apiRequests.notifications;
            const response = await cachedApiRequest(req.apiKey, { data: req.requestData, ttl: req.ttl });

            if (!response?.ok) {
                showUserMessage({ message: TEXT.errors.loadFailed });
                return;
            }

            notificationsState = {
                notifications: response.data?.data?.notifications || [],
                pagination: response.data?.data?.pagination || {},
                isShowingAll: false,
                isFetched: true     // mark as fetched so subsequent clicks use cached state
            };

            dropdownMenu.innerHTML = renderNotificationsDropdownMenu(
                notificationsState.notifications,
                notificationsState.pagination
            );
        } catch (error) {
            logError('Loading notifications failed:', error);
            showUserMessage({ status: 'error', message: TEXT.errors.loadFailed });
        }
    });
}

// ─── Actions ─────────────────────────────────────────
async function markAllNotificationsAsRead(dropdownMenu) {
    if (!dropdownMenu) return;
    if (!notificationsState.notifications.some((n) => !n.is_seen)) return;

    try {
        const response = await apiRequest('update_notifications_seen', { data: { seen_all: true } });

        if (!response?.ok) {
            showUserMessage({ message: TEXT.errors.markFailed });
            return;
        }

        notificationsState.notifications = notificationsState.notifications.map((n) => ({
            ...n,
            is_seen: true,
            seen_at: n.seen_at || new Date().toISOString()
        }));

        dropdownMenu.innerHTML = renderNotificationsDropdownMenu(
            notificationsState.notifications,
            notificationsState.pagination
        );
    } catch (error) {
        logError('Marking notifications as read failed:', error);
        showUserMessage({ status: 'error', message: TEXT.errors.markFailed });
    }
}

async function showAllNotifications(dropdownMenu) {
    if (!dropdownMenu) return;
    if (!notificationsState.pagination.has_next_page) return;

    // already fetched all, re-render from state
    if (notificationsState.isShowingAll) {
        dropdownMenu.innerHTML = renderNotificationsDropdownMenu(
            notificationsState.notifications,
            notificationsState.pagination
        );
        return;
    }

    try {
        const req = apiRequests.notificationsAll;
        const response = await cachedApiRequest(req.apiKey, { data: req.requestData, fresh: req.fresh });

        if (!response?.ok) {
            showUserMessage({ message: TEXT.errors.loadAllFailed });
            return;
        }

        notificationsState = {
            notifications: response.data?.data?.notifications || [],
            pagination: response.data?.data?.pagination || {},
            isShowingAll: true,
            isFetched: true
        };

        dropdownMenu.innerHTML = renderNotificationsDropdownMenu(
            notificationsState.notifications,
            notificationsState.pagination
        );
    } catch (error) {
        logError('Loading all notifications failed:', error);
        showUserMessage({ status: 'error', message: TEXT.errors.loadAllFailed });
    }
}
