# AIRecruiter

AIRecruiter is an intelligent recruitment platform that ingests CVs, extracts candidate data, compares profiles against job requirements, identifies skill gaps, and generates technical interview questions.

## Stack

- Backend: NestJS + TypeORM + PostgreSQL
- Queue: BullMQ + Redis
- AI: Groq (`llama-3.3-70b-versatile`) with regex fallback
- Frontend: React + Vite
- Docs: Swagger (`/api/docs`)

## Environment Variables

Create `.env` in the repository root:

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

GROQ_API_KEY=replace_me
GROQ_MODEL=llama-3.3-70b-versatile

CV_ENCRYPTION_KEY=replace_me_with_a_long_random_secret
```

## Run with Docker Compose

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`
- pgAdmin: `http://localhost:8080`

## Smoke Test Flow

1. Admin creates initial users (no public registration). See "Admin onboarding" below.
2. Create a job with required skills.
3. Open job candidates and upload a CV.
4. Upload endpoint returns `queued`; worker processes asynchronously.
5. Open candidate detail page and wait for status updates (`uploaded` -> `processing` -> `matched` or `failed`).
6. Verify parsed data, match score, skill gaps, and generated interview questions.
7. Use CV download link on candidate detail to validate file retrieval.

## Notes

- If `GROQ_API_KEY` is absent, extraction/matching/questions fall back to deterministic local logic.
- Uploaded CV files are encrypted at rest using AES-256-GCM and decrypted only for processing/download.

## Admin onboarding

- This workspace disables public registration. An administrator must create users and departments.
- To create an initial admin user and a default department, run the seed script:

```bash
cd apps/backend
npm install
node -r ts-node/register scripts/seed-admin.ts
```

Environment variables supported by the seed script: `INIT_ADMIN_EMAIL`, `INIT_ADMIN_PASSWORD`, plus DB connection vars.

After creating the admin, sign in at `/login` and navigate to the Admin -> Users / Departments pages to manage accounts.
