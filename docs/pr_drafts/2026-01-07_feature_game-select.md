# PR: Game Select Page

## Summary
Introduced a "Game Select" page as the main landing screen after login, allowing users to choose which game to play (currently "Imposter Game").

## Changes
- **Frontend**:
  - NEW: `src/app/games/page.tsx` - Displays game cards.
  - MODIFY: `src/app/page.tsx` - Redirects to `/games` on successful login.
  - MODIFY: `src/components/Menu.tsx` - Added "Games" link to navigation.

## Testing
- [x] Login flow redirects to `/games`.
- [x] "Imposter Game" card navigates to `/lobby`.
- [x] Menu "Games" link returns to game selection.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Conventional commits used.
