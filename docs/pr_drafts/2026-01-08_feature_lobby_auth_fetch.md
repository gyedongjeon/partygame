# PR: Fix - Lobby Authentication

## Summary
Updates the Lobby and Room pages to use the new `authFetch` utility instead of legacy `fetch` with cookies. This fixes authentication failures on cross-domain environments (e.g., cloud deployments) where cookies were not reliably sent or accepted.

## Technical Changes
- **Frontend**:
    - `src/app/lobby/page.tsx`: Replaced `fetch` with `authFetch`.
    - `src/app/lobby/[id]/page.tsx`: Replaced `fetch` with `authFetch`.
    - Removed `credentials: 'include'` as `authFetch` handles Bearer tokens.

## Test Report
- [x] Manual Verification: `npm run build` (frontend) passed. Verification on cloud pending deployment.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included and passing (N/A for frontend component logic, build verified).
- [x] Commit messages follow Conventional Commits.
