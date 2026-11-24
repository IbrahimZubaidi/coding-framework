# Coding framework

A reusable starting point for web apps: a FastAPI backend, a plain HTML/CSS/JS frontend with no build step, and a PostgreSQL schema, all following one set of conventions.

The conventions are the main product. `AGENT.md` is the full guide, written for both developers and AI coding assistants.

## What is inside

| Folder | Contents |
|---|---|
| `backend/` | FastAPI app. One file per endpoint, grouped by role (`apis/users`, `apis/admins`), shared helpers in `controls/` (auth, cache, config, responses). |
| `frontend/users/` | Static pages. One HTML file plus one JS module per page, reusable components, i18n (English and Arabic), theme support. |
| `db/` | `schema.sql`, `indexes.sql`, `reset.sql` and a fake data seed. |
| `migration/` | Scripts to clone, rebuild and reset the database. |
| `tests/` | Pytest tests for APIs, controls and migrations. |

## Main conventions

- One file = one endpoint, with a fixed structure and a standard response contract.
- One page = one HTML file + one JS module. No frontend build tools.
- Every table has the standard columns, enums are `SMALLINT` codes, and rows are soft-deleted, never removed.
- Naming rules for files, Python, JavaScript, CSS and the database.

See `AGENT.md` for the details and examples, and `FIGMA.md` for the design handoff rules.

## Run locally

```
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

The backend needs a PostgreSQL database (and Redis for caching). Settings are read from `backend/.env`, which is not committed.

## Status

Work in progress. Parts of it will be turned into Claude Code skills.
