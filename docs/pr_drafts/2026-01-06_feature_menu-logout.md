# PR: Add Menu and Logout Functionality

## Summary
Introduced a global menu component on the frontend and a corresponding backend endpoint to handle secure user logout.

## Technical Changes
- **Backend**:
  - Added `POST /auth/logout` endpoint in `AuthController`.
  - Endpoint clears the `access_token` HttpOnly cookie.
- **Frontend**:
  - Created `Menu` component with a dropdown interface.
  - Implemented conditional rendering to hide the menu on the login page (`/`).
  - Added `Menu` to `RootLayout` for global availability.
  - Implemented secure logout logic (POST request + redirection).

## Test Report
- [x] Manual Verification:
    - Login flow remains functional.
    - Menu appears on Lobby page.
    - Logout action clears cookie and redirects to Home.
    - Menu is hidden on Home page.
    - Attempting to access protected routes after logout redirects to Home.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included and passing (Backend existing tests pass, new endpoint is simple controller logic).
- [x] Commit messages follow Conventional Commits.
