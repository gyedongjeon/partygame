# PR: Feature - HTTP Request Logging

## Summary
Implements a global `LoggerMiddleware` to log details of every incoming HTTP request (Method, URL, Status Code, Duration). This provides visibility into traffic and API usage in production environments where access logs were previously missing.

## Technical Changes
- **Backend**:
    - `src/middleware/logger.middleware.ts`: Created middleware to intercept requests and log performance metrics.
    - `src/app.module.ts`: Registered the middleware for all routes.

## Test Report
- [x] Manual Verification: Verified request logs appear on localhost. `npm run build` passed.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included and passing (N/A for logger middleware logic, relied on manual verification).
- [x] Commit messages follow Conventional Commits.
