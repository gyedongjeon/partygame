# PR Title: feat: implement google login with nestjs passport and nextjs ui

## Summary
Implemented the full-stack Google Authentication flow.
- **Backend**: Uses `passport-google-oauth20` to validate users and issues a JWT via an HTTP-Only cookie.
- **Frontend**: Added a simple Login UI with a "Continue with Google" button.
- **Infrastructure**: Added `docker-compose.yml` for local PostgreSQL support.

## Technical Changes
- **Backend**:
  - NEW `AuthModule`: Handles Google OAuth handshake.
  - NEW `UsersModule`: Manages User persistence in PostgreSQL.
  - NEW `User` Entity: Stores `googleId`, `email`, `avatarUrl`.
  - UPDATE `AppModule`: Configured `ConfigModule` and `TypeOrmModule`.
  - UPDATE `main.ts`: Changed port to **4000** and added global prefix `api`.
- **Frontend**:
  - UPDATE `page.tsx`: Added login button component.
- **DevOps**:
  - NEW `docker-compose.yml`: PostgreSQL service.
  - UPDATE `README.md`: Added setup instructions.

## Test Report
- [x] Backend builds successfully (`npm run build`).
- [x] Frontend builds successfully (`npm run build`).
- [x] Manual verification:
    - [x] Servers start (Port 3000 & 4000).
    - [x] Database connects via TypeORM.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included (scaffolded spec files).
- [x] No breaking changes.
