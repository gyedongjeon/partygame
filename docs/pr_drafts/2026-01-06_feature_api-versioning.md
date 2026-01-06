# PR Title: feat: implement api versioning and remove global prefix

## Summary
Refactored the API structure to use URI Versioning (`v1`) instead of a global `api` prefix.
- **Base URL**: Changed from `/api/...` to `/v1/...`.
- **Swagger**: Moved from `/api/docs` to `/docs`.

## Technical Changes
- **Backend**:
    - Enabled `VersioningType.URI` in `main.ts` (default: '1').
    - Removed `app.setGlobalPrefix('api')`.
    - Updated `SwaggerModule` setup to `/docs`.
    - Updated `GoogleStrategy` callback URL to use `/v1`.
- **Frontend**:
    - Updated Google Login link to point to `/v1/auth/google`.

## Test Report
- [x] Backend builds successfully.
- [x] Frontend builds successfully.
- [x] Swagger UI loads at `http://localhost:4000/docs`.
- [x] Manual verification of Login Flow (Backend redirects to correct callback).

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included (existing tests pass).
- [x] **BREAKING CHANGE**: API Base URL changed.
