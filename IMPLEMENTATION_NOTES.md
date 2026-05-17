Summary of changes for Internal HR & Dept Workflow (2-day MVP)

Backend changes (apps/backend/src):

- Added entities:
  - `departments/entities/department.entity.ts`
  - `questions/entities/question.entity.ts`
  - `availability/entities/availability.entity.ts`
  - `interviews/entities/interview.entity.ts`
- Added modules, services, controllers, and DTOs for Departments, Questions, Availability, Interviews.
- Added `departmentId` to `users/entities/user.entity.ts` and `jobs/entities/job.entity.ts`.
- Disabled public registration by removing `POST /auth/register` from `auth.controller.ts`.
- Restricted CV upload endpoint to `RECRUITER` and `ADMIN` roles in `candidates.controller.ts`.
- Registered new modules in `apps/backend/src/app.module.ts`.
- Added seed script: `apps/backend/scripts/seed-admin.ts` (creates default Department + Admin user).

Frontend changes (apps/frontend/src):

- Removed public register UI and link from `LoginPage` and `App.tsx`.
- Updated `AuthContext` to include `departmentId` in `User` and removed public `register` method from exported API.
- Added API clients: `api/departments.ts`, `api/questions.ts`, `api/availability.ts`, `api/interviews.ts`.
- Added Admin pages: `pages/admin/AdminUsersPage.tsx`, `pages/admin/AdminDepartmentsPage.tsx`.
- Added Tech Lead pages: `pages/techlead/*` for questions, availability, and interviews.
- Added HR schedule component: `pages/hr/HRScheduleInterviewPage.tsx`.
- Updated `App.tsx` routes and `Navbar.tsx` to show role-specific navigation.

Notes / manual steps:

- Run the seed script to create an initial Admin and Department (adjust env vars if needed):

  # from repo root

  cd apps/backend
  npm install
  node -r ts-node/register scripts/seed-admin.ts

  Environment variables supported by the seed script:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `INIT_ADMIN_EMAIL` (default: admin@company.local)
  - `INIT_ADMIN_PASSWORD` (default: adminpass)

- Backend server: `cd apps/backend && npm run start:dev`
- Frontend server: `cd apps/frontend && npm run dev`

Files changed/added (high level):

- apps/backend/src/departments/\*\*
- apps/backend/src/questions/\*\*
- apps/backend/src/availability/\*\*
- apps/backend/src/interviews/\*\*
- apps/backend/src/users/entities/user.entity.ts (added departmentId)
- apps/backend/src/jobs/entities/job.entity.ts (added departmentId relation)
- apps/backend/src/auth/auth.controller.ts (removed register endpoint)
- apps/backend/scripts/seed-admin.ts (new)
- apps/frontend/src/context/AuthContext.tsx (user shape updated)
- apps/frontend/src/App.tsx (routes updated)
- apps/frontend/src/pages/admin/\*\*
- apps/frontend/src/pages/techlead/\*\*
- apps/frontend/src/pages/hr/HRScheduleInterviewPage.tsx
- apps/frontend/src/api/{departments,questions,availability,interviews}.ts

If you want, I can:

- Run the seed script for you (requires DB accessible from this environment).
- Start dev servers and run quick smoke tests (you previously asked not to run servers).
- Add basic frontend unit tests or backend e2e tests.

Limitations and assumptions:

- No external calendar integration; scheduling uses simple in-app availability slots.
- Candidate uploads reuse the existing `UploadService` (encrypted storage + parsing).
- Public registration disabled; Admin must create users.
- Database synchronize is enabled (`synchronize: true`) in dev; for production use migrations.
