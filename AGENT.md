# CLAUDE.md — Framework Guide

This file is for both teammates and AI assistants (Claude Code). Read it before writing any code.

---

## Framework Overview

This is a generic, reusable framework for building web applications. The codebase is intentionally pattern-focused and can be extended for any project domain. The infrastructure, patterns, and conventions are documented in `/memory/` for any AI to understand and build on top of.

---

## Quick Navigation

| Topic | Section |
|---|---|
| **Naming** | [Naming Conventions](#naming-conventions) |
| **Tech Stack** | [Tech Stack](#tech-stack) |
| **Folder Structure** | [Repository Layout](#repository-layout) |
| **Backend Endpoints** | [Backend Rules](#backend-rules--read-before-writing-any-endpoint) |
| **Database** | [Database Rules](#database-structure--patterns) |
| **Frontend Pages** | [Frontend Rules](#frontend-rules--read-before-writing-any-page) |
| **API/Frontend Integration** | [Frontend Rules — Forms](#forms) |
| **Environment** | [Environment Variables](#environment-variables) |
| **Running Locally** | [Running Locally](#running-locally) |

---

## Naming Conventions

Apply consistently across every file written or modified.

### Files
| Type | Style | Example |
|---|---|---|
| HTML pages | `kebab-case` | `student-profile.html` |
| JS page files | `kebab-case` | `student-profile.js` |
| JS service / util / component files | `camelCase` | `apiRequests.js`, `navbarShared.js` |
| Python / API files | `snake_case` verb_noun | `read_student.py`, `create_exam.py` |
| CSS files | `kebab-case` | `student-profile.css` |

No `Helper` / `Manager` / `Util` suffixes on files — the folder gives that context.

### JavaScript
| What | Style | Notes |
|---|---|---|
| Functions | `camelCase` verb+noun | `getStudent()` — private: `_load()` |
| Event handlers | `camelCase` on+noun | `onSubmit()`, `onLocaleChange()` |
| Variables | `camelCase` | `studentData`, `currentPage` |
| Booleans | `camelCase` is/has/can | `isLoading`, `hasError` |
| Arrays | `camelCase` plural | `courses`, `students` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES`, `API_BASE_URL` |
| Classes | `PascalCase` single noun | `PageManager`, `CacheStore` |

Scope rule: wider scope = more descriptive name. Avoid `data`, `info`, `temp`, `stuff`.

### Python
| What | Style |
|---|---|
| Variables & functions | `snake_case` |
| Classes (Pydantic models, etc.) | `PascalCase` |
| Constants | `SCREAMING_SNAKE_CASE` |
| API file verbs | `read`=GET, `create`=POST, `update`=PATCH, `delete`=DELETE |

### CSS
- Classes, IDs, file names: `kebab-case`
- State modifiers: `is-` prefix (`is-active`, `is-loading`)
- Custom properties: `--kebab-case` semantic names (`--color-primary`, never `--blue`)
- Max 2–3 words per class name

### Database
- Tables and columns: `snake_case`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI (Python, fully async) |
| Database | PostgreSQL — `psycopg` async driver + `psycopg_pool` |
| Cache / Sessions | Redis — `redis.asyncio`, versioned namespace invalidation |
| Auth | JWT (access + refresh tokens) in HttpOnly cookies, auto-refreshed via middleware |
| Password hashing | `pwdlib[argon2]` |
| Config | `pydantic-settings` + `.env` file |
| File storage | Cloudinary (optional) |
| Frontend | Plain HTML + Vanilla JS (ES modules) + Bootstrap 5 (CDN) — **no React, no Vue, no bundler** |

---

## Repository Layout

```
app/
├── backend/
│   ├── app.py                    # FastAPI app factory, middleware, exception handlers
│   ├── requirements.txt
│   ├── application/
│   │   └── openapi.py            # OpenAPI tags metadata
│   ├── controls/                 # Shared infrastructure — DO NOT put business logic here
│   │   ├── config.py             # Settings (pydantic-settings)
│   │   ├── connection.py         # Lifespan: DB pool + Redis startup/shutdown
│   │   ├── extensions.py         # Global singletons: db_pool, redis_client
│   │   ├── db.py                 # get_db_conn context manager + query instrumentation
│   │   ├── auth.py               # JWT helpers, cookie management, role guards
│   │   ├── auth_cache.py         # Redis-backed refresh token storage
│   │   ├── cache.py              # Versioned cache: get/set/delete/invalidate
│   │   ├── cache_utils.py        # build_cache_key(), compress/decompress
│   │   ├── exceptions.py         # Global exception handlers
│   │   ├── responses.py          # success_response() / error_response()
│   │   ├── passwords.py          # argon2 hashing
│   │   ├── telemetry.py          # In-memory request/DB/cache metrics
│   │   └── cloudinary_service.py # Image upload
│   └── apis/
│       ├── __init__.py           # Root router → /api/v1
│       ├── common/enums.py       # Shared IntEnum types
│       ├── users/                # User-facing API domain
│       │   ├── __init__.py       # Domain router, assembles all sub-routers
│       │   └── <domain>/         # One folder per feature domain
│       │       └── <action>.py   # One file per endpoint
│       └── admins/               # Admin API domain (same structure)
└── frontend/
    └── public/
        ├── index.html            # Redirects to home.html
        ├── <page>.html           # One HTML file per page
        └── assets/
            ├── css/
            │   ├── app.css       # Master CSS: imports tokens → themes → base → components
            │   ├── tokens.css    # CSS custom properties (design tokens)
            │   ├── themes.css    # [data-theme="dark"] overrides
            │   ├── base.css      # Global resets
            │   ├── components/   # Per-component CSS
            │   └── pages/        # Per-page CSS
            └── js/
                ├── config.js     # window.APP_CONFIG — must load before any module
                ├── scripts.js    # Global DOM init (non-module)
                ├── pages/        # One JS module per page
                ├── components/   # Shared UI: atoms, cards, sections, navbar, sidebar, footer
                ├── services/     # apiRequests, forms, i18n, localStorage, theme, logger...
                ├── guards/       # Route guards (protect.js)
                └── locales/      # i18n JSON files (en.json, ar.json, ...)
```

---

## Backend Rules — Read Before Writing Any Endpoint

### One file = one endpoint
Every endpoint lives in its own file. File name = verb_noun matching the HTTP action:

```
read_items.py      → GET    /items
read_item.py       → GET    /items/{id}
create_item.py     → POST   /items
update_item.py     → PATCH  /items/{id}
delete_item.py     → DELETE /items/{id}
delete_items.py    → DELETE /items  (bulk)
```

Never combine multiple endpoints in one file. `_example_api.py` is the only exception — it is a reference file, not a real endpoint.

### Endpoint file structure (follow this exactly)
```python
from fastapi import APIRouter, Depends
from psycopg.rows import dict_row
from pydantic import BaseModel

from controls import db
from controls.auth import get_student          # or get_admin / get_instructor
from controls.responses import success_response, error_response

router = APIRouter()

class MyRequestBody(BaseModel):               # define body model in same file
    field: str

@router.post("/some/path")
async def my_endpoint(
    data: MyRequestBody,
    student=Depends(get_student),             # drop if public endpoint
    conn=Depends(db.get_db_conn_dep),
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT ...", (param,))
            row = await cur.fetchone()

        await conn.commit()                   # always commit explicitly after writes
        return success_response(row)

    except Exception as e:
        return error_response(str(e), status_code=500, exc=e)
```

### Critical rules
- **No ORM** — all SQL is raw inline strings with `%s` placeholders
- **Never raise `HTTPException`** in handlers — always `return error_response(...)`
- **Always commit explicitly** after any write (`await conn.commit()`)
- **Cache pattern**: `cache_get_raw` → serve cached → on miss: query DB → `cache_set_raw_backpressured`
- **Cache invalidation**: `cache_delete_pattern(build_cache_key("namespace", user_id, "*"))`

### Router `__init__.py` pattern
```python
from fastapi import APIRouter
from .create_thing import router as create_thing
from .read_thing  import router as read_thing

router = APIRouter()
router.include_router(create_thing, tags=["Things"])
router.include_router(read_thing,   tags=["Things"])
```

### Response contract
All responses use one of two helpers from `controls/responses.py`:
```python
success_response(data, status_code=200)          # → {"data": ...}
error_response("message", status_code=4xx/5xx)   # → {"error": "..."}
```

### Auth dependency options
```python
from controls.auth import get_student, get_admin, get_instructor, get_optional_student
# Usage: student=Depends(get_student)  →  student['user_id'], student['role']
```

---

## Frontend Rules — Read Before Writing Any Page

### No build tools
No webpack, vite, npm build, TypeScript. Everything runs directly in the browser as-is.

### One page = one HTML file + one JS module
- `public/<page>.html`
- `public/assets/js/pages/<page>.js` (loaded as `type="module"`)

### Two page types

#### Public page (no auth, no sidebar)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/png" href="./assets/images/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <title>IMF AutoML — Page Name</title>
    <link rel="stylesheet" href="./assets/css/pages/<page>.css">
</head>
<body>
    <header></header>
    <main>
        <div id="hero"        data-spinner></div>
        <div id="someSection" data-spinner></div>
        <div id="staticSection"           ></div>
    </main>
    <footer></footer>

    <script src="./assets/js/config.js"></script>
    <script src="./assets/js/scripts.js"></script>
    <script type="module" src="./assets/js/pages/<page>.js"></script>
</body>
</html>
```

#### Dashboard page (authenticated, with sidebar)
```html
<body>
    <header></header>
    <main>
        <aside></aside>
        <div class="page-content">
            <section id="page-header"></section>
            <section id="page-body"  ></section>
        </div>
    </main>
    <footer></footer>

    <script src="./assets/js/config.js"></script>
    <script src="./assets/js/scripts.js"></script>
    <script type="module" src="./assets/js/pages/<page>.js"></script>
</body>
```

### HTML structure rules
- `<header>`, `<footer>` are always **empty shells** — JS injects content via `mountPublicNavbar()` / `mountDashboardNavbar()` / `renderFooter()`
- `<aside>` is **only on dashboard pages**, placed **inside `<main>`** before `.page-content`, always empty
- Public pages: **no `<aside>`** in HTML at all
- Script load order is always: `config.js` → `scripts.js` → `type="module"` page script. Never change this order.
- `config.js` must load before any module — modules read `window.APP_CONFIG` on import

### Section ID naming by page type
- **Public pages** → section IDs use `camelCase`: `hero`, `statsBar`, `featuredCourses`, `howItWorks`
- **Dashboard pages** → section IDs use `kebab-case`: `dashboard-kpis`, `courses-header`, `transactions-table`
- **Public pages with split content** → outer div has no spinner, inner content div gets `data-spinner`:
  ```html
  <div id="blogsSection">
      <div id="blogsSection-filters"></div>
      <div id="blogsSection-content" data-spinner></div>
  </div>
  ```

### `data-spinner` rule
Add `data-spinner` only to sections whose content is fetched asynchronously (API call before render).
Omit it on sections that render immediately from static HTML.
`scripts.js` injects a loading spinner into every `[data-spinner]` element on page load.

### i18n
- Add `data-i18n="key"` to any translatable text element
- Add translation keys to `assets/js/locales/en.json` (and any other locale files)
- Use `t("key")` or `t({ i18n: "key", text: "fallback" })` in JS

### Forms
```javascript
import { initForms } from '../services/forms.js';
initForms(); // auto-handles validation, loading state, form:success / form:error events
```
HTML form needs `data-api="endpointKey"` attribute.

### CSS conventions
- All colors/spacing via CSS custom properties defined in `tokens.css`
- Dark theme: add overrides to `[data-theme="dark"]` in `themes.css`
- New component CSS → add file to `components/` and import in `app.css`
- Page-specific CSS → add file to `pages/` and link in that page's `<head>`

### Section comment style in JS
```javascript
// ─── Section Name ─────────────────────────────────────
// · Sub-section Name
```
Never use `// ---`, `// ===`, `// **`, or any other separator style.

### i18n — TEXT constant pattern
All page strings go in a single `TEXT` constant at the top of the file. Never use `lbl`, `btn`, `msg`, or any other name.

Structure mirrors the page's render sections. Sub-elements nested inside their section.

**File order:** imports → `TEXT` constant → class/functions/bootstrap call.

```javascript
const TEXT = {
    hero: {
        breadcrumb    : { i18n: '', text: 'Home'      },
        title         : { i18n: '', text: 'Welcome'   },
        offer: {
            guarantee  : { i18n: '', text: '30-day guarantee'     },
            footerNote : { i18n: '', text: 'Cancel anytime'       },
        },
    },
    tabs: {
        overview : { i18n: '', text: 'Overview' },
        details  : { i18n: '', text: 'Details'  },
    },
};
```

**Usage rules:**
- `t(TEXT.hero.title)` ✓ — never `t(TEXT.hero.title.i18n)` ✗
- Button text → `data-i18n` on inner `<span>`, NOT the `<button>` (applyLocale would wipe children)
- Placeholder → `data-i18n-placeholder` on the `<input>`
- Mixed static + dynamic → `<span data-i18n="${TEXT.x.i18n}">${t(TEXT.x)}</span><strong>${value}</strong>`
- JS-only string (never rendered to HTML) → `t(TEXT.x)` inline, no `data-i18n` needed
- Call `applyLocale()` after every dynamic HTML injection

### initEventListeners pattern
`initEventListeners()` and all `init*` methods must only contain calls to named handler methods. Never write inline logic inside them.

```javascript
// WRONG
initEventListeners() {
    document.querySelector('.btn')?.addEventListener('click', () => { /* logic here */ });
}

// CORRECT
initEventListeners() {
    this.initSubmitListener();
}

initSubmitListener() {
    document.querySelector('.btn')?.addEventListener('click', () => { /* logic here */ });
}
```

### Global form HTML structure
Always use these global classes. Never create component-scoped replacements.

```html
<div class="form-field">
    <label for="fieldId" data-i18n="">Label</label>
    <div class="form-field__input-wrap">
        <input id="fieldId" ...>
        <span class="form-field-error"></span>
    </div>
</div>
```

Global classes: `form-field`, `form-field__input-wrap`, `form-field-error`, `form-row`, `form-hint`

If a component needs extra styling, add an *additional* class alongside the global one — never replace it.

---

---

## Database Structure & Patterns

### Directory Structure
```
db/
├── __commands.ps1      # PowerShell runner — executes all SQL files
├── reset.sql           # Drops & recreates public schema
├── schema.sql          # CREATE TABLE — source of truth
├── indexes.sql         # CREATE INDEX — performance tuning
└── big_fake_seed.sql   # INSERT INTO — test data
```

### Every Table Must Have
```sql
CREATE TABLE example (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    status SMALLINT DEFAULT 0,  -- 0=active, 1=deleted, 2=archived
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Rules:**
- `id` — auto-increment primary key
- `status SMALLINT` — NOT `is_deleted BOOLEAN`. Enables 3+ states for soft deletes
- `created_at, updated_at` — automatic timestamps
- `REFERENCES ... ON DELETE CASCADE` — cleanup on parent delete

### SMALLINT Enums (NOT TEXT)
Store enums as SMALLINT with integer codes, not TEXT:

```sql
-- ✅ CORRECT
CREATE TABLE users (
    role SMALLINT DEFAULT 0,    -- 0=user, 1=moderator, 2=admin
    status SMALLINT DEFAULT 0   -- 0=active, 1=deleted
);

-- ❌ WRONG
CREATE TABLE users (
    role TEXT DEFAULT 'user',
    is_deleted BOOLEAN DEFAULT FALSE
);
```

**Why SMALLINT?**
- Efficient (2 bytes vs TEXT 10+ bytes)
- Typed (Python IntEnum enforces valid codes)
- Indexed (faster queries)
- Forces documentation

### Standard Enum Codes (All Projects)

| Field | Code | Meaning |
|---|---|---|
| `status` | 0 | ACTIVE (normal state) |
| `status` | 1 | DELETED (soft delete, hidden) |
| `status` | 2 | ARCHIVED (optional, historical) |

Create Python IntEnum in `backend/apis/common/enums.py`:
```python
from enum import IntEnum

class Status(IntEnum):
    ACTIVE = 0
    DELETED = 1
    ARCHIVED = 2
```

### Soft Delete Pattern (Never Use DELETE)
```python
# ❌ WRONG — Data loss
await cur.execute("DELETE FROM items WHERE id = %s", (item_id,))

# ✅ CORRECT — Mark deleted, keep data
from apis.common.enums import Status
await cur.execute(
    "UPDATE items SET status = %s, updated_at = NOW() WHERE id = %s",
    (Status.DELETED, item_id)
)
```

### Query Pattern: Always Filter by Status
```python
# ❌ WRONG — Shows deleted items
await cur.execute("SELECT * FROM items WHERE user_id = %s", (user_id,))

# ✅ CORRECT — Hide deleted items
await cur.execute(
    "SELECT * FROM items WHERE user_id = %s AND status = %s",
    (user_id, Status.ACTIVE)
)
```

### Workflow

**First setup:**
```bash
./db/__commands.ps1  # Runs: reset → schema → indexes → seed
```

**After schema changes:**
1. Edit `db/schema.sql`
2. Run `__commands.ps1`
3. Update `db/indexes.sql` if needed
4. Update API endpoints (if columns changed)
5. Update JS pages (only if response shape changed)

**Add an index:**
1. Write query in endpoint first
2. Measure if slow
3. Add index to `indexes.sql` with comment showing endpoint file
4. Run: `psql $DATABASE_URL -f db/indexes.sql`

---

## API Response & Error Handling

### Response Structure

**Success:**
```json
{
  "data": <any JSON value>
}
```

**Error:**
```json
{
  "error": "Human-readable message"
}
```

### Backend Example
```python
from controls.responses import success_response, error_response

@router.post("/items")
async def create_item(data: ItemRequest, student=Depends(get_student), conn=Depends(db.get_db_conn_dep)):
    try:
        # Validate
        if len(data.name) < 3:
            return error_response("Name too short", 400)
        
        # Query
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "INSERT INTO items (user_id, name, status, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW()) RETURNING *",
                (student['user_id'], data.name, Status.ACTIVE)
            )
            item = await cur.fetchone()
        
        await conn.commit()
        return success_response(item, status_code=201)
        
    except Exception as e:
        return error_response("Failed to create item", 500, exc=e)
```

### HTTP Status Codes

| Code | When to Use |
|---|---|
| 200 | GET/PATCH/DELETE successful |
| 201 | POST successful (created) |
| 400 | Validation error (bad input) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (no permission for action) |
| 404 | Not found (ID doesn't exist) |
| 409 | Conflict (constraint violated, duplicate) |
| 500 | Server error (unexpected exception) |

### Frontend: fetchRequestData
```javascript
try {
    const item = await fetchRequestData('getItem');
    console.log(item.name);  // Unwrapped automatically
} catch (error) {
    console.error(error.message);  // "Item not found"
    
    if (error.status === 401) {
        window.location.href = '/login.html';
    }
}
```

### Frontend: Error Handling Strategy

**Spinner → Error Message** (critical sections):
```javascript
async loadDashboard() {
    const div = document.getElementById('dashboard');
    div.innerHTML = '<div class="spinner"></div>';
    
    try {
        const data = await fetchRequestData('getDashboard');
        div.innerHTML = renderDashboard(data);
    } catch (error) {
        div.innerHTML = '<div class="alert alert-danger">Failed to load dashboard</div>';
    }
}
```

**Silent Fail** (non-critical sections):
```javascript
async loadOptionalWidget() {
    const div = document.getElementById('optional');
    try {
        const data = await fetchRequestData('getOptional');
        div.innerHTML = render(data);
    } catch (error) {
        div.style.display = 'none';  // Silently hide
    }
}
```

---

## Validation Strategy

**Client-side (UX):** HTML5 + JavaScript
- Catch user mistakes early
- Show inline errors with `form-field-error` class
- Better experience

**Server-side (Security):** Pydantic + business logic
- Prevent malicious input
- Enforce business rules
- Both required

```python
# Backend: Pydantic validates type/format
class CreateItemRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    price: float = Field(..., gt=0)

@router.post("/items")
async def create_item(data: CreateItemRequest, ...):
    # Pydantic already validated name length and price > 0
    # Add business logic validation here
    if await item_name_exists(data.name):
        return error_response("Name already used", 409)
    # ... create item ...
```

```html
<!-- Frontend: HTML5 validation -->
<form data-api="createItem">
    <div class="form-field">
        <label for="name">Item Name</label>
        <div class="form-field__input-wrap">
            <input id="name" name="name" type="text" required minlength="3" maxlength="255">
            <span class="form-field-error"></span>
        </div>
    </div>
    <button type="submit">Create</button>
</form>
```

---

## Authentication & JWT Tokens

### Token System

**Access Token** (15 minutes)
- Short-lived, used in every API request
- Stored in HttpOnly cookie
- If stolen, attacker has limited time

**Refresh Token** (7 days)
- Long-lived, stored in Redis
- Used to get new access tokens
- Can be revoked immediately on logout
- Not sent with every request (safer)

### Logout Flow
1. User clicks logout
2. Backend revokes refresh token from Redis
3. Both cookies are cleared
4. User must login again to get new tokens

```python
@router.post("/logout")
async def logout(request: Request):
    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    await revoke_student_refresh_session(refresh_token)
    
    response = success_response(status_code=200)
    clear_auth_cookies(response)
    return response
```

### Auto-Refresh Middleware
1. Frontend makes request with access token
2. Middleware checks if token expired
3. If expired but refresh token exists:
   - Backend validates refresh token from Redis
   - Generates new access token
   - Sets new cookie in response
4. If refresh token also expired:
   - Return 401 Unauthorized
   - Frontend redirects to login

This is transparent to frontend — no extra code needed.

### Cookie Properties
- `HttpOnly=True` — JS cannot access (XSS protection)
- `Secure=True` — only sent over HTTPS
- `SameSite=Lax` — prevents CSRF
- `Path=/` — sent to all endpoints
- `max_age` — TTL in seconds

### Frontend: Auth Guards
```python
# Get logged-in student (required)
student=Depends(get_student)
# Returns 401 if invalid/missing token

# Get admin only (required, checks role)
admin=Depends(get_admin)
# Returns 403 if not admin role

# Optional (returns None if not logged in)
student=Depends(get_optional_student)
```

---

## Services & Utilities

### Frontend Services (in `assets/js/services/`)

**apiRequests.js**
```javascript
export const API_MAP = {
    getItems: { method: 'GET', url: '/api/v1/items' },
    createItem: { method: 'POST', url: '/api/v1/items' },
    deleteItem: { method: 'DELETE', url: '/api/v1/items/{id}' },
};

export async function fetchRequestData(key, options = {}) {
    // Fetches from API_MAP[key], unwraps response
}
```

**i18n.js** — Language switching
```javascript
export async function setLocale(locale) {
    // Fetch locale JSON, store in localStorage, update DOM
}

export function t(textObj) {
    // Translate text object { i18n: 'key', text: 'fallback' }
}

export function onLocaleChange(callback) {
    // Register listener for language changes
}
```

**currency.js** — Currency switching
```javascript
export async function setCurrency(code) {
    // Fetch rates, store in localStorage, update DOM
}

export function formatPrice(amount, currency) {
    // Format with currency symbol
}
```

**forms.js** — Auto-handles form submission
```javascript
export function initForms() {
    // Auto-wire all forms[data-api="..."]
    // Handles validation, loading state, errors
    // Emits form:success and form:error events
}
```

**localStorage.js** — Storage wrapper
```javascript
export function getStorage(key, defaultValue) { }
export function setStorage(key, value) { }
export function removeStorage(key) { }
export function clearStorage() { }
```

---

## General Rules (Backend + Frontend)

### No duplicate logic
Before writing any logic, search for it in existing files first.
- If it exists anywhere in the same portal → reuse it, never rewrite.
- Before writing a utility → check `services/` and `utils/` first.
- Before writing a component → check `components/`.
- Before writing an API endpoint → check if an existing one can be extended.

### Always check the schema before DB code
Before writing or modifying anything that touches the database (queries, endpoints, models), open `db/schema.sql` first.

It is the source of truth for: table names, column names, types, FK relationships, and enum integer codes.

- New endpoint → confirm tables/columns exist in schema
- SQL query → verify every table/column/JOIN before writing
- Enum value → look up the exact integer code
- New model → match field names exactly to column names

### API add/update workflow
When adding or updating any API endpoint, follow this order:

1. Read `db/schema.sql` — verify every table/column/JOIN matches before writing any code
2. Write or update the endpoint
3. Add or update DB indexes — **after** the query is finalized, never before. Only on create/update, not on deletions
4. Update JS pages — only if the API response shape changed (added/removed/renamed fields in the SELECT)

Indexes must reflect the actual query that exists. Write them by looking at the final WHERE/JOIN/ORDER BY clauses.

### Schema change workflow
When updating `db/schema.sql`, always update downstream files in this order (skip steps that don't exist yet):

1. `db/schema.sql` — the change itself
2. Seed files — inserts must match the new structure
3. API endpoints — queries use updated/added columns
4. Indexes — cover new columns if needed
5. API response shape check — did any SELECT's returned columns change?
6. JS pages — **only if** the API response shape changed (JS reads responses, not the schema directly)

The JS page step is conditional — an internal column change (e.g. adding `is_deleted`) may never surface in any response and requires no JS update. A renamed column that appears in a SELECT does.

---

## Environment Variables

Copy `.env.example` to `.env` (never commit `.env`).

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string (optional — disables cache if absent) |
| `JWT_SECRET` | Secret for signing JWTs |
| `SECRET_KEY` | General app secret |
| `ENV` | `development` or `production` |
| `CLOUDINARY_URL` | Cloudinary connection string (optional) |

---

## Running Locally

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Frontend is static — open `frontend/public/home.html` directly in a browser, or serve the `public/` folder with any static file server.
