# PR: Fix - Auth Redirect Protocol for Cloud Environments

## Summary
Fixes a `404 Not Found` error during Google Login on cloud environments where `FRONTEND_URL` might be defined without a protocol (e.g., `app.vercel.app` instead of `https://app.vercel.app`). The backend now automatically prepends `https://` if missing.

## Technical Changes
- **Backend**:
    - `auth.controller.ts`: Added logic to check if `redirectBase` starts with `http`. If not, it prepends `https://`.
    - `auth.controller.spec.ts`: Added unit tests to verify standard redirection and the protocol fix.

## Test Report
- [x] Unit Tests: `npm test src/auth/auth.controller.spec.ts` passed.
- [x] Manual Verification: Verified via unit tests that `my-app.vercel.app` becomes `https://my-app.vercel.app/api/auth/callback...`.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included and passing.
- [x] Commit messages follow Conventional Commits.
