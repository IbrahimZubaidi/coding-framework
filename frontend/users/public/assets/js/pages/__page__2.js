// ─── Imports ──────────────────────────────────────────────────────────────────
// Order: Services → Utils → Layout Components → Page Components → Globals

/* Services */
import { getThemeMode, initThemeMode }              from '../services/theme.js';
import { logMessage, logError, isDevelopment }       from '../services/logger.js';
import { initLocale, onLocaleChange, t } from '../services/i18n.js';
import { initCurrency, onCurrencyChange, formatPrice } from '../services/currency.js';
import { initForms }                                 from '../services/forms.js';
import { clearCache }                                from '../services/cache.js';

/* Utils */
import { redirectToLogin, redirectAfterAuth, renderPasswordToggle, initPasswordToggle } from '../utils/auth.js';
import { getCurrentPage, isDev, navigateTo, pushFiltersToUrl, formatRelativeTime, getTimeOfDay } from '../utils/helpers.js';
import { formatDate, formatCount, formatCurrency, formatOrdinal, buildPageNumbers } from '../utils/format.js';
import { fetchRequestData }   from '../utils/fetchData.js';
import { initCustomSelects, refreshCustomSelect } from '../utils/customSelect.js';
import { initCascadeSelect }  from '../utils/cascadeSelect.js';
import { saveStudent, getStudent, clearStudent } from '../services/localStorage.js';
import { saveCourse, getCourse, clearCourse }   from '../services/sessionStorage.js';

/* Layout Components */
import { renderFooter }          from '../components/footer/footer.js';
import { mountPublicNavbar }     from '../components/navbar/publicNavbar.js';
import { mountDashboardNavbar }  from '../components/navbar/dashboardNavbar.js';
import { mountStudentSidebar }   from '../components/sidebar/studentSidebar.js';
import { mountCourseSidebar }    from '../components/sidebar/courseSidebar.js';

/* Page Components — atoms */
import { showUserMessage }   from '../components/atoms/message.js';
import { showConfirmModal }  from '../components/atoms/confirmModal.js';
import { setButtonLoading, clearButtonLoading, getLoadingHtml } from '../components/atoms/loading.js';
import { renderBreadcrumb }  from '../components/atoms/breadcrumb.js';
import { renderBadge, renderTag } from '../components/atoms/badge.js';

/* Page Components — layout / data */
import { renderSectionHeader } from '../components/sectionHeader.js';
import { renderKpiCard }       from '../components/cards/kpiCard.js';
import { renderPagination }    from '../components/pagination.js';
import { renderDataTable, initDataTable } from '../components/dataTable.js';
import { renderSearchInput }   from '../components/searchInput.js';

/* Globals — always last */
import '../scripts.js';

// ─── TEXT ─────────────────────────────────────────────────────────────────────
// All user-facing strings live here. Structure mirrors the page sections.
// Usage: t(TEXT.hero.title)  ✓     never: t(TEXT.hero.title.i18n)  ✗
// Button text → data-i18n on inner <span>, NOT the <button> (applyLocale wipes children).
// Placeholder → data-i18n-placeholder on the <input>.
// Mixed static + dynamic → <span data-i18n="${TEXT.x.i18n}">${t(TEXT.x)}</span><strong>${value}</strong>
// JS-only string (never in HTML) → t(TEXT.x) inline, no data-i18n needed.

const TEXT = {
    // ─── Hero section
    hero: {
        title      : { i18n: '', text: 'Page Title'           },
        subtitle   : { i18n: '', text: 'Page subtitle text.'  },
        search     : { i18n: '', text: 'Search…'              },
    },

    // ─── Breadcrumb
    breadcrumb: {
        home    : { i18n: '', text: 'Home'         },
        section : { i18n: '', text: 'Section'      },
        current : { i18n: '', text: 'Current Page' },
    },

    // ─── Section header
    sectionHeader: {
        title    : { i18n: '', text: 'Section Title'    },
        subtitle : { i18n: '', text: 'Showing {n} items' },
        btnAdd   : { i18n: '', text: '+ New Item'        },
        btnExport: { i18n: '', text: 'Export'            },
    },

    // ─── KPI cards
    kpis: {
        total    : { i18n: '', text: 'Total Items'   },
        active   : { i18n: '', text: 'Active'        },
        accuracy : { i18n: '', text: 'Accuracy'      },
        revenue  : { i18n: '', text: 'Revenue'       },
    },

    // ─── Items list / table
    items: {
        empty        : { i18n: '', text: 'No items found.'                },
        searchPlaceholder : { i18n: '', text: 'Search items…'            },
        colName      : { i18n: '', text: 'Name'                          },
        colStatus    : { i18n: '', text: 'Status'                        },
        colDate      : { i18n: '', text: 'Date'                          },
        colActions   : { i18n: '', text: 'Actions'                       },
        chipAll      : { i18n: '', text: 'All'                           },
        chipActive   : { i18n: '', text: 'Active'                        },
        chipArchived : { i18n: '', text: 'Archived'                      },
    },

    // ─── Filter drawer
    filterDrawer: {
        title  : { i18n: '', text: 'Filters' },
        apply  : { i18n: '', text: 'Apply'   },
        reset  : { i18n: '', text: 'Reset'   },
        status : {
            label    : { i18n: '', text: 'Status'   },
            all      : { i18n: '', text: 'All'       },
            active   : { i18n: '', text: 'Active'    },
            archived : { i18n: '', text: 'Archived'  },
        },
        category: {
            label   : { i18n: '', text: 'Category'          },
            default : { i18n: '', text: 'Select a category' },
        },
    },

    // ─── Form
    form: {
        nameLabel        : { i18n: '', text: 'Name'           },
        emailLabel       : { i18n: '', text: 'Email'          },
        emailPlaceholder : { i18n: '', text: 'you@example.com'},
        passwordLabel    : { i18n: '', text: 'Password'       },
        submitBtn        : { i18n: '', text: 'Submit'         },
        submittingBtn    : { i18n: '', text: 'Submitting…'    },
        successMsg       : { i18n: '', text: 'Saved successfully.'       },
        errorMsg         : { i18n: '', text: 'Something went wrong.'     },
    },

    // ─── Confirm modal
    confirmDelete: {
        title   : { i18n: '', text: 'Delete Item'                        },
        body    : { i18n: '', text: 'This action cannot be undone.'      },
        confirm : { i18n: '', text: 'Delete'                             },
        cancel  : { i18n: '', text: 'Cancel'                             },
    },

    // ─── Toasts / messages
    messages: {
        saved   : { i18n: '', text: 'Changes saved.'            },
        deleted : { i18n: '', text: 'Item deleted.'             },
        error   : { i18n: '', text: 'Something went wrong.'     },
        noAccess: { i18n: '', text: 'You do not have access.'   },
    },

    // ─── Greeting (time-of-day)
    greeting: {
        morning   : { i18n: '', text: 'Good morning'   },
        afternoon : { i18n: '', text: 'Good afternoon' },
        evening   : { i18n: '', text: 'Good evening'   },
    },
};

// ─── PageManager ──────────────────────────────────────────────────────────────
//
// BASE CLASS NOTE
// Every page repeats the same constructor + init shell. A future refactor could
// extract a BasePageManager into services/ — but hold off until all pages are stable.
//
//   class BasePageManager {
//       constructor() {
//           this.theme       = getThemeMode();
//           this.currentPage = getCurrentPage();
//           this.apiRequests = {};
//           initCurrency();
//           initThemeMode();
//           initLocale().then(() => this.init()).catch(e => logError('init failed', e));
//       }
//       async init() {
//           await this.validatePageAccess();
//           await this.renderPageLayout();
//           await this.renderSections();
//           this.initFormListeners();
//           this.initEventListeners();
//           onLocaleChange(() => { this.onLocaleChange(); });
//           onCurrencyChange(() => this.onCurrencyChange());
//       }
//   }

class PageManager {
    constructor() {
        this.theme       = getThemeMode();
        this.currentPage = getCurrentPage();

        // ─── API Requests ──────────────────────────────────
        // Each entry is a request config passed to fetchRequestData().
        // fetchRequestData() mutates responseData in-place after the call.
        //
        // Fields:
        //   apiKey      — key in STUDENT_API_MAP (apiRequests.js)
        //   requestData — query/body params sent to the API
        //                 lang: true → replaced with current locale automatically
        //   responseData— null until fetchRequestData() resolves
        //   params      — URL path params e.g. { course_id: 5 } for /courses/{course_id}
        //   cache       — false to skip cache for this request
        //   ttl         — ms until this cache entry auto-expires
        this.apiRequests = {
            student : { apiKey: 'read_student',  requestData: {},                        responseData: null, params: null },
            items   : { apiKey: 'read_courses',  requestData: { limit: 10, lang: true }, responseData: null, params: null },
            item    : { apiKey: 'read_course',   requestData: {},                        responseData: null, params: { course_id: null } },

            // cache: false — never cache (e.g. notifications, live data)
            // notifications: { apiKey: 'read_notifications', requestData: {}, cache: false, responseData: null },

            // ttl — cache expires after N ms (e.g. 60 seconds)
            // kpis: { apiKey: 'read_dashboard_kpis', requestData: {}, ttl: 60_000, responseData: null },
        };

        // ─── Page-level state ──────────────────────────────
        this.filters = {
            page      : 1,
            sortBy    : 'created_at',
            sortOrder : 'DESC',
            search    : null,
        };

        // ─── Init ──────────────────────────────────────────
        // Read URL filters first (before initLocale) so requestData is ready
        // when the first fetch fires inside init().
        this._readUrlFilters();
        initCurrency();
        initThemeMode();
        initLocale()
            .then(() => this.init())
            .catch(e => logError('Page init failed', e));
    }

    // ─── Page Init ────────────────────────────────────────────────────────────
    async init() {
        await this.validatePageAccess();
        await this.renderPageLayout();

        // Each renderXxxSection() fetches its own data then renders immediately.
        // All sections run in parallel — one slow fetch doesn't block the others.
        await Promise.all([
            this.renderPageHeader()   .catch(e => logError('renderPageHeader failed', e)),
            this.renderKpisSection()  .catch(e => logError('renderKpisSection failed', e)),
            this.renderItemsSection() .catch(e => logError('renderItemsSection failed', e)),
            this.renderFormSection()  .catch(e => logError('renderFormSection failed', e)),
        ]);

        this.initFormListeners();
        this.initEventListeners();

        // Re-render sections when locale changes — t() inside each render handles translation inline.
        onLocaleChange(() => {
            Promise.all([
                this.renderPageHeader()   .catch(e => logError('renderPageHeader (locale) failed', e)),
                this.renderItemsSection() .catch(e => logError('renderItemsSection (locale) failed', e)),
            ]);
        });

        // Re-render only sections that display prices when currency changes.
        onCurrencyChange(() => {
            this.renderKpisSection().catch(e => logError('renderKpisSection (currency) failed', e));
        });
    }

    // ─── Page Access ──────────────────────────────────────────────────────────
    // Fetch the current student. If not found → redirect to login.
    // In dev mode, bypass the redirect so the page still loads for testing.
    async validatePageAccess() {
        await fetchRequestData(this.apiRequests.student);

        if (!this.apiRequests.student.responseData) {
            logError('validatePageAccess: no student — not logged in');
            if (!isDev()) { redirectToLogin(); return; }
        }

        // Redirect already-logged-in users away from auth pages (login, register):
        // if (this.apiRequests.student.responseData) {
        //     if (!isDev()) { navigateTo('home.html'); return; }
        // }
    }

    // ─── Page Layout ──────────────────────────────────────────────────────────
    // DASHBOARD: mountDashboardNavbar + mountStudentSidebar (no footer)
    async renderPageLayout() {
        await Promise.all([
            mountDashboardNavbar(this.theme),
            mountStudentSidebar(this.currentPage),
        ]);
    }

    // ─── URL Filters ──────────────────────────────────────────────────────────
    // Read filter/sort/pagination state from the URL on page load.
    // Call in constructor BEFORE initLocale so requestData is ready for the first fetch.
    _readUrlFilters() {
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search');
        const page   = parseInt(params.get('page'), 10);
        const sort   = params.get('sort');

        if (search)   this.filters.search = search;
        if (page > 1) this.filters.page   = page;
        if (sort) {
            const [sortBy, sortOrder] = sort.split(':');
            if (sortBy)    this.filters.sortBy    = sortBy;
            if (sortOrder) this.filters.sortOrder = sortOrder.toUpperCase();
        }

        this._syncFiltersToRequestData();

        // Path param example — read dataset_id from URL for dataset-scoped pages:
        // const datasetId = params.get('dataset_id');
        // if (datasetId) this.apiRequests.item.params = { dataset_id: datasetId };
    }

    // ─── Filter Helper ────────────────────────────────────────────────────────
    // Updates this.filters, syncs to requestData, pushes URL, busts cache, re-renders.
    _applyFilters(updates = {}) {
        Object.assign(this.filters, updates);
        this._syncFiltersToRequestData();
        pushFiltersToUrl(this._currentFilterParams());
        clearCache('read_courses', { data: this.apiRequests.items.requestData });
        this.renderItemsSection().catch(e => logError('renderItemsSection (filter) failed', e));
    }

    // Builds requestData from this.filters.
    _syncFiltersToRequestData() {
        const f  = this.filters;
        const rd = { limit: 10, lang: true };
        if (f.search)      rd.search     = f.search;
        if (f.page > 1)    rd.page       = f.page;
        if (f.sortBy)      rd.sort_by    = f.sortBy;
        if (f.sortOrder)   rd.sort_order = f.sortOrder;
        this.apiRequests.items.requestData = rd;
    }

    // Returns current filter state as URL-ready params object.
    _currentFilterParams() {
        const f = this.filters;
        return {
            search : f.search || null,
            page   : f.page > 1 ? f.page : null,
            sort   : f.sortBy ? `${f.sortBy}:${f.sortOrder.toLowerCase()}` : null,
        };
    }

    // ─── Section: Hero ────────────────────────────────────────────────────────
    async renderHeroSection() {
        this._renderHeroHtml();
    }

    _renderHeroHtml() {
        const el = document.querySelector('#hero');
        if (!el) return;

        // Breadcrumb — trail of links, last item is current page (no link).
        const breadcrumbHtml = renderBreadcrumb([
            { label: TEXT.breadcrumb.home,    href: 'home.html' },
            { label: TEXT.breadcrumb.section, href: 'section.html' },
            { label: TEXT.breadcrumb.current },
        ]);

        // Search input
        const searchHtml = renderSearchInput({ placeholder: TEXT.hero.search });

        el.innerHTML = `
            <section class="hero">
                <div class="container">
                    ${breadcrumbHtml}
                    <h1 class="hero__title" data-i18n="${TEXT.hero.title.i18n}">${t(TEXT.hero.title)}</h1>
                    <p  class="hero__subtitle" data-i18n="${TEXT.hero.subtitle.i18n}">${t(TEXT.hero.subtitle)}</p>
                    ${searchHtml}
                </div>
            </section>`;

    }

    // ─── Section: Page Header ─────────────────────────────────────────────────
    async renderPageHeader() {
        this._renderPageHeaderHtml();
    }

    _renderPageHeaderHtml() {
        const el = document.querySelector('#page-header');
        if (!el) return;

        el.innerHTML = `
            <div class="page-header">
                <h1 data-i18n="${TEXT.hero.title.i18n}">${t(TEXT.hero.title)}</h1>
                <p data-i18n="${TEXT.hero.subtitle.i18n}">${t(TEXT.hero.subtitle)}</p>
            </div>`;
    }

    // ─── Section: KPIs ────────────────────────────────────────────────────────
    async renderKpisSection() {
        this._renderKpisHtml();
    }

    _renderKpisHtml() {
        const el = document.querySelector('#statsBar');
        if (!el) return;

        const kpis = this.apiRequests.items.responseData?.data;

        // formatPrice() respects the active currency (JOD/USD/etc.)
        const iconTotal   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
        const iconRevenue = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;

        const cards = [
            {
                icon: iconTotal, iconBg: 'rgba(241,128,32,0.1)', iconColor: '#F18020',
                value: formatCount(kpis?.total ?? 0),
                label: TEXT.kpis.total,
                hint : '+12 today', hintColor: '#F18020',
            },
            {
                icon: iconRevenue, iconBg: 'rgba(0,201,80,0.1)', iconColor: '#00C950',
                value: formatPrice(kpis?.revenue ?? 0),
                label: TEXT.kpis.revenue,
            },
            // centered: true — center-aligns icon + text (useful in stat grids)
            {
                value: `${kpis?.accuracy ?? 0}%`,
                label: TEXT.kpis.accuracy,
                centered: true,
            },
        ];

        el.innerHTML = `<div class="kpis-grid">${cards.map(c => renderKpiCard(c)).join('')}</div>`;
    }

    // ─── Section: Items List ──────────────────────────────────────────────────
    async renderItemsSection() {
        await fetchRequestData(this.apiRequests.items);
        this._renderItemsHtml();
    }

    _renderItemsHtml() {
        const el = document.querySelector('#itemsSection');
        if (!el) return;

        const data       = this.apiRequests.items.responseData?.data;
        const items      = data?.courses ?? [];
        const pagination = data?.pagination;
        const total      = pagination?.total_rows ?? items.length;

        // Section header with dynamic subtitle and action buttons.
        // subtitle as string (not i18n object) → renders as-is (supports dynamic values).
        const headerHtml = renderSectionHeader({
            title    : TEXT.sectionHeader.title,
            subtitle : `${total} ${t(TEXT.sectionHeader.subtitle)}`,
            buttons  : [
                { label: TEXT.sectionHeader.btnAdd,    action: 'add-item'          },
                { label: TEXT.sectionHeader.btnExport, action: 'export', variant: 'outline' },
            ],
        });

        // Data table — renderRow returns one <tr> per item.
        const tableHtml = renderDataTable({
            containerId   : 'items-table',
            toolbarSearch : { placeholder: TEXT.items.searchPlaceholder },
            toolbarChips  : [
                { label: TEXT.items.chipAll,      value: ''         },
                { label: TEXT.items.chipActive,   value: 'active'   },
                { label: TEXT.items.chipArchived, value: 'archived' },
            ],
            columns: [
                { key: 'name',   label: TEXT.items.colName,    sortable: true },
                { key: 'status', label: TEXT.items.colStatus,  width: '120px' },
                { key: 'date',   label: TEXT.items.colDate,    sortable: true, width: '160px' },
                { key: 'actions',label: TEXT.items.colActions, width: '80px'  },
            ],
            rows      : items,
            renderRow : (item) => `
                <tr data-id="${item.id}">
                    <td>${item.name ?? ''}</td>
                    <td>${renderBadge({ i18n: '', text: item.status ?? 'active' })}</td>
                    <td>${formatDate(item.created_at)}</td>
                    <td>
                        <button class="btn btn--ghost" data-action="delete-item" data-id="${item.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                    </td>
                </tr>`,
            emptyLabel : TEXT.items.empty,
            footer     : renderPagination(pagination),
        });

        el.innerHTML = `
            <div class="container">
                ${headerHtml}
                ${tableHtml}
            </div>`;

        // Wire table search / chip / sort events after injecting HTML.
        initDataTable(document.querySelector('#items-table'));
    }

    // ─── Section: Form ────────────────────────────────────────────────────────
    async renderFormSection() {
        this._renderFormHtml();
    }

    _renderFormHtml() {
        const el = document.querySelector('#formSection');
        if (!el) return;

        const f = TEXT.form;

        // Form structure rules:
        //   · <form data-api="apiKey"> — initForms() picks it up automatically
        //   · novalidate — we handle validation in forms.js, not native browser
        //   · .form-field > label + .form-field__input-wrap > input + .form-field-error
        //   · Button text on inner <span data-i18n> — NOT on <button> (applyLocale wipes children)
        //   · Password field: renderPasswordToggle() inside .form-field__input-wrap

        el.innerHTML = `
            <div class="container">
                <form id="example-form" class="form-card" data-api="update_profile" novalidate>

                    <div class="form-field">
                        <label for="ex-name" data-i18n="${f.nameLabel.i18n}">${t(f.nameLabel)}</label>
                        <div class="form-field__input-wrap">
                            <input type="text" id="ex-name" name="name" required minlength="2" maxlength="50">
                            <span class="form-field-error"></span>
                        </div>
                    </div>

                    <div class="form-field">
                        <label for="ex-email" data-i18n="${f.emailLabel.i18n}">${t(f.emailLabel)}</label>
                        <div class="form-field__input-wrap">
                            <input type="email" id="ex-email" name="email"
                                placeholder="${t(f.emailPlaceholder)}"
                                data-i18n-placeholder="${f.emailPlaceholder.i18n}"
                                required>
                            <span class="form-field-error"></span>
                        </div>
                    </div>

                    <div class="form-field">
                        <label for="ex-password" data-i18n="${f.passwordLabel.i18n}">${t(f.passwordLabel)}</label>
                        <div class="form-field__input-wrap">
                            <input type="password" id="ex-password" name="password"
                                placeholder="••••••••" minlength="8" maxlength="128" required>
                            ${renderPasswordToggle()}
                            <span class="form-field-error"></span>
                        </div>
                    </div>

                    <!-- Select with custom styled dropdown -->
                    <div class="form-field">
                        <label for="ex-category">Category</label>
                        <div class="form-field__input-wrap">
                            <select id="ex-category" name="category">
                                <option value="" disabled selected data-i18n="${TEXT.filterDrawer.category.default.i18n}">${t(TEXT.filterDrawer.category.default)}</option>
                                <option value="a">Option A</option>
                                <option value="b">Option B</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="btn">
                        <span data-i18n="${f.submitBtn.i18n}">${t(f.submitBtn)}</span>
                    </button>

                </form>
            </div>`;

        // Init custom select dropdowns inside this section.
        initCustomSelects(el);
    }

    // ─── Form Listeners ───────────────────────────────────────────────────────
    // Wire form:success / form:error events AFTER the form HTML is in the DOM.
    // initForms() is called in initEventListeners — it attaches the submit handler.
    initFormListeners() {
        document.querySelector('#example-form')?.addEventListener('form:success', (e) => {
            const response = e.detail.response;
            showUserMessage({ status: 'success', message: TEXT.messages.saved });
            redirectAfterAuth();          // example: redirect after login/register
        });

        document.querySelector('#example-form')?.addEventListener('form:error', (e) => {
            showUserMessage({ status: 'error', message: TEXT.messages.error });
        });
    }

    // ─── Event Listeners ──────────────────────────────────────────────────────
    // Only calls named methods — never inline logic here.
    initEventListeners() {
        initForms();                  // activates all form[data-api] submit handlers
        initPasswordToggle();         // activates all .password-toggle buttons

        this._initHeroSearchListeners();
        this._initTableListeners();
        this._initPaginationListeners();
        this._initActionListeners();
    }

    // ─── Hero Search ──────────────────────────────────────────────────────────
    _initHeroSearchListeners() {
        const hero = document.querySelector('#hero');
        if (!hero) return;

        const triggerSearch = () => {
            const search = hero.querySelector('.search-input__field')?.value.trim() || null;
            this._applyFilters({ search, page: 1 });
        };

        hero.addEventListener('click',   e => { if (e.target.closest('.search-input__btn')) triggerSearch(); });
        hero.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.closest('.search-input__field')) triggerSearch(); });
    }

    // ─── Table: search, chips, sort ───────────────────────────────────────────
    _initTableListeners() {
        const section = document.querySelector('#itemsSection');
        if (!section) return;

        // table:search fires on Enter or native × clear
        section.addEventListener('table:search', e => {
            this._applyFilters({ search: e.detail.value || null, page: 1 });
        });

        // table:chip fires when a filter chip is clicked; e.detail.values = array of active chip values
        section.addEventListener('table:chip', e => {
            this._applyFilters({ status: e.detail.values[0] || null, page: 1 });
        });

        // table:sort fires when a sortable column header is clicked
        section.addEventListener('table:sort', e => {
            this._applyFilters({ sortBy: e.detail.key, sortOrder: e.detail.order.toUpperCase(), page: 1 });
        });
    }

    // ─── Pagination ───────────────────────────────────────────────────────────
    _initPaginationListeners() {
        document.querySelector('#itemsSection')?.addEventListener('click', e => {
            const btn = e.target.closest('.pagination__btn[data-page]');
            if (!btn || btn.classList.contains('pagination__btn--disabled')) return;
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this._applyFilters({ page: parseInt(btn.dataset.page, 10) });
        });
    }

    // ─── Action buttons (delete, edit, etc.) ──────────────────────────────────
    _initActionListeners() {
        document.querySelector('#itemsSection')?.addEventListener('click', async e => {
            // Section header button
            const headerBtn = e.target.closest('[data-action="add-item"]');
            if (headerBtn) { navigateTo('item-create.html'); return; }

            // Delete button inside table row
            const deleteBtn = e.target.closest('[data-action="delete-item"]');
            if (deleteBtn) {
                await this._handleDeleteItem(deleteBtn.dataset.id);
                return;
            }
        });
    }

    // ─── Delete Item ──────────────────────────────────────────────────────────
    // showConfirmModal() returns Promise<boolean> — true if user confirmed.
    async _handleDeleteItem(itemId) {
        const confirmed = await showConfirmModal({
            title   : TEXT.confirmDelete.title,
            body    : TEXT.confirmDelete.body,
            confirm : TEXT.confirmDelete.confirm,
            cancel  : TEXT.confirmDelete.cancel,
            danger  : true,
        });

        if (!confirmed) return;

        // Show loading state on the row's delete button while the request is in flight.
        const btn = document.querySelector(`[data-action="delete-item"][data-id="${itemId}"]`);
        setButtonLoading(btn);

        try {
            // Direct apiRequest for non-GET (no cache involved).
            // Import apiRequest from apiRequests.js if needed:
            // import { apiRequest } from '../services/apiRequests.js';
            // const response = await apiRequest('delete_item', { params: { item_id: itemId } });
            // if (!response.ok) { showUserMessage({ status: 'error', message: TEXT.messages.error }); return; }

            // Invalidate the list cache and re-render.
            clearCache('read_courses');
            showUserMessage({ status: 'success', message: TEXT.messages.deleted });
            await this.renderItemsSection();
        } finally {
            clearButtonLoading(btn);
        }
    }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    new PageManager();
});
