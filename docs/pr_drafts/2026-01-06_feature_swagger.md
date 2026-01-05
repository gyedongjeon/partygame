# PR Title: feat: add swagger documentation

## Summary
Integrated **Swagger (OpenAPI)** into the NestJS backend to automatically generate and visualize API documentation.
- **Swagger UI**: Available at `/api/docs`.
- **Documentation**: Added tags and property descriptions to Auth and Users modules.

## Technical Changes
- **Backend (NestJS)**:
    - Installed `@nestjs/swagger` and `swagger-ui-express`.
    - Configured `DocumentBuilder` in `src/main.ts`.
    - Added `@ApiTags`, `@ApiOperation`, `@ApiResponse` to `AuthController` and `UsersController`.
    - Added `@ApiProperty` to `User` entity.

## Test Report
- [x] Backend builds successfully.
- [x] Swagger UI loads at `http://localhost:4000/api/docs`.
- [x] Endpoints (`/api/auth/google`) are listed correctly.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included (existing tests pass).
- [x] No breaking changes.
