# PR Title: feat: initialize project with NestJS, Next.js 16, and Tailwind 4

## Summary
Initialized the repository structure for the `partygame` full-stack application. Established the `frontend` (Next.js) and `backend` (NestJS) directories, configured the build tools, and set up the development environment.

## Technical Changes
- **Backend**:
  - Initialized NestJS application in `/backend`.
  - Installed `typeorm` and `pg` for PostgreSQL connectivity.
  - Configured strict TypeScript settings.
- **Frontend**:
  - Initialized Next.js 16 (Canary) application in `/frontend`.
  - Configured Tailwind CSS v4.
  - Added UI Component libraries: `lucide-react`, `@radix-ui/react-dialog`, `@radix-ui/react-slot`.
  - Integrated `i18next` for internationalization.
- **Project Root**:
  - Created root `.gitignore` to handle multi-project exclusions.
  - Added `.agent/rules/project_rules.md` for coding standards.

## Test Report
- [x] `npm run build` passed in `/backend`.
- [x] `npm run build` passed in `/frontend`.
- [x] No breaking changes introduced (fresh project).

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included and passing (Default framework tests passing).
- [x] No breaking changes.
