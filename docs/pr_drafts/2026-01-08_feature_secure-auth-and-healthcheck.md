# PR: Feature - Secure Auth & Health Check

## Summary
Implements a backend health check endpoint, enhances CORS configuration, and fixes cross-domain Google Login issues by switching to explicit Bearer token authentication.

## Technical Changes
- **Backend**:
    - Added `GET /health` endpoint (status & timestamp).
    - Updated CORS to accept `CORS_ORIGINS` env var.
    - Decoupled `secure` cookie attribute from `SameSite` logic in `AuthController` to allow proper testing on HTTPS development servers.
- **Frontend**:
    - Created `authFetch` utility to send `Authorization: Bearer <token>` header.
    - Updated `Menu.tsx` and `page.tsx` to use `authFetch`, bypassing third-party cookie blocking issues.
    - Configured `SameSite=Lax` for development environment cookies.

## Test Report
- [x] Backend Unit Tests: `npm test` passed (including new `AppController` tests).
- [x] Manual Verification:
    - Health check returns 200 OK.
    - Google Login works on Localhost.
    - Logic updated to support Production/Cross-Domain scenarios.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included and passing.
- [x] Commit messages follow Conventional Commits.
