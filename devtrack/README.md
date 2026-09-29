# DevTrack

**Build. Track. Ship.** DevTrack is a developer project and task management platform: a React single-page app on top of a FastAPI + PostgreSQL REST API.

## Features

- Email/password accounts with JWT authentication, bcrypt password hashing and protected routes
- Projects: status, technology stack, GitHub/live URLs, dates, search, filter, sort, and progress derived from tasks
- Tasks: status, priority, due date, quick complete/reopen, search, filter by status/priority/project, sort
- Dashboard: seven stat cards, project-status, task-completion and 7-day productivity charts, recent items and upcoming deadlines
- Profile (bio, picture URL, skills, GitHub, LinkedIn, portfolio) and settings (account, theme, password, logout)
- Light and dark themes, responsive sidebar and tables, toasts, skeleton loaders, empty and error states
- Users can only ever read or change their own data (other users' records return `404`)

## Technology stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite, JavaScript, Tailwind CSS, React Router, Axios, Recharts, Lucide icons, Vitest |
| Backend | Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2, Pydantic 2 + Pydantic Settings, Alembic, python-jose, bcrypt |
| Database | PostgreSQL 16 (SQLite is used only by the test suite) |
| DevOps | Docker, Docker Compose, nginx, GitHub Actions |

## Architecture

```
Browser ──> nginx (static React build)          :3000
   │
   └──────> FastAPI  /api/*  /health  /docs     :8000 ──> PostgreSQL :5432
```

The backend is layered as `api/routes` (HTTP) → `services` (ownership checks) → `models` (SQLAlchemy), with `schemas` (Pydantic) validating all input and output. IDs are UUIDs. Passwords are never returned by the API.

## Project structure

```
devtrack/
├── frontend/   React app (components, pages, layouts, services, hooks, context, utils)
├── backend/    FastAPI app (app/api, core, db, models, schemas, services), tests, alembic
├── .github/workflows/ci.yml
├── docker-compose.yml
└── .env.example
```

## Prerequisites

Docker with Compose v2, **or** Python 3.12+, Node.js 20+ and a PostgreSQL 14+ server.

## Environment variables

| Variable | Where | Description |
| --- | --- | --- |
| `DATABASE_URL` | backend | SQLAlchemy URL, e.g. `postgresql+psycopg://devtrack:devtrack@localhost:5432/devtrack` |
| `SECRET_KEY` | backend | JWT signing key, **32+ characters**. Generate with `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | backend | Token lifetime (default 60) |
| `CORS_ORIGINS` | backend | Comma-separated allowed browser origins |
| `VITE_API_URL` | frontend | API base URL used at build time. Empty in dev uses the Vite proxy |

Copy `.env.example` to `.env` (root, for Compose) and `backend/.env.example` to `backend/.env` (for running the backend directly). Never commit real secrets.

## Docker setup (recommended)

```bash
cp .env.example .env        # optional: set SECRET_KEY
docker compose up --build
```

- App: <http://localhost:3000>
- API docs: <http://localhost:8000/docs> (ReDoc: `/redoc`)
- Health: <http://localhost:8000/health>

On start the backend container runs `alembic upgrade head` and, when `SEED_DEMO_DATA=true` (the default), seeds the demo account.

**Demo account (development only):** `demo@devtrack.dev` / `DemoPass123!`. It is created by `python -m app.seed` and is not a real credential. Set `SEED_DEMO_DATA=false` for any shared or production deployment.

## Local development (without Docker)

**Database:** start PostgreSQL and create a `devtrack` database/user (or run only the DB with `docker compose up db`).

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then set SECRET_KEY
alembic upgrade head
python -m app.seed                # optional demo data
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173, proxies /api to :8000
```

## Database migrations

```bash
alembic upgrade head                                   # apply migrations
alembic revision --autogenerate -m "describe change"   # create a migration after changing models
alembic downgrade -1                                   # roll back one step
```

## Testing

```bash
cd backend && pytest -q        # registration, login, auth, project/task CRUD, ownership isolation, dashboard
cd frontend && npm test        # unit tests for formatting and error helpers
```

## API overview

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Projects | `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/{id}` (query: `q`, `status`, `sort`, `order`) |
| Tasks | `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/{id}` (query: `q`, `status`, `priority`, `project_id`, `sort`, `order`) |
| Profile | `GET/PUT /api/users/me`, `POST /api/users/me/password` |
| Dashboard | `GET /api/dashboard/stats` |
| Health | `GET /health` |

Send the token from `/api/auth/login` as `Authorization: Bearer <token>`. Errors use `{"detail": "..."}`; validation errors (`422`) also include an `errors` array of `{field, message}`.

## Deployment

1. Build and push the two images (`backend/Dockerfile`, `frontend/Dockerfile`) to a registry.
2. Provision managed PostgreSQL and set `DATABASE_URL`, a strong `SECRET_KEY`, and `CORS_ORIGINS` to your frontend's public origin.
3. Build the frontend image with `--build-arg VITE_API_URL=https://api.your-domain.com`.
4. Terminate TLS in front of both services, set `SEED_DEMO_DATA=false`, and run behind a process manager or container platform (Fly.io, Render, ECS, Cloud Run, etc.). The backend applies migrations on start.

## CI/CD

`.github/workflows/ci.yml` runs on every push to `main` and every pull request: backend tests, `alembic upgrade head` against a PostgreSQL service, frontend unit tests and the production build. Any failure fails the workflow.

## Screenshots

Add screenshots to `docs/screenshots/` and reference them here after running the app.

## Known limitations

- Access tokens live in `localStorage` (simple, but exposed to XSS); there is no refresh-token flow or password-reset email.
- The profile picture is a URL, not an upload.
- No rate limiting on auth endpoints.

## Future improvements

Refresh tokens and httpOnly cookies, email verification and password reset, Kanban board view, file uploads for avatars, team collaboration and comments, rate limiting, end-to-end tests.

## Author

Created by _your name_ — replace this line with your details.
