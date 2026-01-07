# PR: Chore - Enable Production Logs

## Summary
Explicitly configures the NestJS application logger to output `['error', 'warn', 'log', 'debug', 'verbose']` levels. This ensures that backend logs are visible in production environments (e.g., cloud dashboards) where they might otherwise be suppressed by default or platform settings.

## Technical Changes
- **Backend** (`src/main.ts`): Updated `NestFactory.create` to include the `logger` option with all standard levels.

## Test Report
- [x] Manual Verification: `npm run build` passed. Verified locally that logs still appear.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included and passing (N/A for config change, build verified).
- [x] Commit messages follow Conventional Commits.
