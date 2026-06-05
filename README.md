<!--
	Professional README for AIRecruiter
	Rewritten to provide clear project overview, setup, usage, and contribution guidance.
-->

# AIRecruiter

> AI-powered recruitment platform that ingests CVs, extracts candidate data, evaluates fit against job requirements, highlights skill gaps, and generates technical interview questions.

## Key features

- Automated CV parsing and data extraction (Groq AI with deterministic fallback)
- Profile-to-job matching with skill gap identification
- Automated technical interview question generation
- Secure encrypted storage for uploaded CVs (AES-256-GCM)
- Queue-based processing using BullMQ + Redis for scalable background work

## Architecture & Tech Stack

- Backend: NestJS, TypeORM, PostgreSQL
- Queue / Workers: BullMQ, Redis
- AI: Groq (configurable model) with regex/local fallback
- Frontend: React + Vite
- API docs: Swagger available at `/api/docs`

## Getting started — prerequisites

- Docker & Docker Compose (recommended) or Node.js 18+ and PostgreSQL + Redis locally
- (Optional) `pnpm` / `npm` for local development

## Quickstart (Docker)

1. Copy the example environment file and update secrets:

```bash
cp .env.example .env
# Edit .env to set DB, Redis and API keys
```

2. Start all services:

```bash
docker compose up --build
```

Services once running:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- pgAdmin (if enabled): http://localhost:8080

## Environment variables

Create a `.env` file in the repository root with required values. Example variables used by the project:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=airecruiter

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=replace_me

GROQ_API_KEY=replace_me # optional, AI extraction; when absent uses local logic
GROQ_MODEL=llama-3.3-70b-versatile

CV_ENCRYPTION_KEY=replace_me_with_a_long_random_secret
```

Notes:

- If `GROQ_API_KEY` is not provided, Groq-based features fall back to deterministic local logic.
- Uploaded CV files are encrypted at rest using AES-256-GCM and decrypted only for processing or download.

## Admin onboarding (initial setup)

This workspace disables public registration. An administrator must create initial accounts.

To create the first admin user and a default department:

```bash
cd apps/backend
npm install
node -r ts-node/register scripts/seed-admin.ts
```

Set `INIT_ADMIN_EMAIL` and `INIT_ADMIN_PASSWORD` as environment variables when running the script (along with DB connection vars).

After the admin account is created, sign in at `/login` and use the Admin UI to manage users and departments.

## Typical developer flow (local)

1. Start PostgreSQL and Redis (via Docker or locally).
2. Copy `.env` and configure connections.
3. Start backend in watch mode (from `apps/backend`):

```bash
npm install
npm run start:dev
```

4. Start frontend (from `apps/frontend`):

```bash
npm install
npm run dev
```

5. Upload a CV through the UI to exercise the processing pipeline. Background workers process uploads and update candidate status.

## Smoke test checklist

1. Create an admin user (seed script).
2. Create a job with required skills in the Admin UI.
3. Navigate to the job candidates screen and upload a CV.
4. Confirm the upload response is `queued` and a worker processes the file.
5. Verify candidate transitions: `uploaded` → `processing` → `matched` (or `failed`).
6. Inspect parsed candidate data, match score, skill gaps, and generated questions.

## Development notes

- Background processing and CV parsing are implemented as asynchronous workers; check `apps/backend/src/queue` and `apps/backend/src/candidates` for processors.
- AI-related logic lives under `apps/backend/src/ai` and supports a Groq API integration with model selection via `GROQ_MODEL`.
- Uploaded files are encrypted under `apps/backend/uploads` — encryption/decryption keys come from `CV_ENCRYPTION_KEY`.

## Contributing

Contributions are welcome. Suggested process:

1. Open an issue describing the change or bug.
2. Branch from `master` and create a clear PR with tests where applicable.
3. Keep changes scoped; follow existing code style.

## License & Contact

Specify your project license here (e.g., MIT) and provide contact or maintainers information.

---

If you'd like, I can also:

- Add a `.env.example` file to the repo with all variables listed.
- Add badges (build/test/coverage) and a CONTRIBUTING.md.
- Split the README into `docs/` pages for more detailed developer guides.

To view the updated file, see [README.md](README.md).
