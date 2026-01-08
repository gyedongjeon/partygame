# PR: Fix - Lobby CORS & Auth

## Summary
Fixes WebSocket connection failures on non-localhost environments by genericizing the `LobbyGateway` CORS configuration and refactoring the frontend socket client to use consistent authentication.

## Technical Changes
- **Backend** (`src/lobby/lobby.gateway.ts`):
    - Replaced hardcoded `localhost:3000` CORS origin with dynamic logic respecting `process.env.CORS_ORIGINS`.
- **Frontend** (`src/hooks/useSocket.ts`):
    - Removed redundant cookie parsing logic.
    - Integrated `getToken()` from `utils/auth.ts` for consistent Bearer token usage.

## Test Report
- [x] Backend Unit Tests: `npm test src/lobby` passed.
- [x] Manual Verification: Verified socket connection logic sends token correctly.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included and passing.
- [x] Commit messages follow Conventional Commits.
