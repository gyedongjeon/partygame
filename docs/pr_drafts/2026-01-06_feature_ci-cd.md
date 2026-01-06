# PR Title: feat: add ci workflow for backend and frontend

## Summary
Introduced **GitHub Actions** for Continuous Integration (CI).
- **Triggers**: Pushes and PRs to `main` and `develop`.
- **Jobs**:
  - `backend`: Installs, Lints, Tests.
  - `frontend`: Installs, Lints, Builds.

## Technical Changes
- **.github/workflows/ci.yml**: Defined workflow with two parallel jobs running on `ubuntu-latest` with Node.js 20.

## Test Report
- [x] Workflow syntax is valid.
- [x] (Manual) Verify Actions tab after push.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] CI Only change.
