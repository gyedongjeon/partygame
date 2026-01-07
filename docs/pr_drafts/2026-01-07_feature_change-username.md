# PR: Change Username Feature

## Summary
Added functionality for users to change their display name and for this name to be visible in the game lobby.

## Changes
- **Backend Users**:
  - `UsersService`: Added `update` method.
  - `UsersController`: Added `PATCH /users/me` endpoint.
  - `JwtStrategy`: Added `id` to `AuthenticatedUser`.
- **Backend Lobby**:
  - `LobbyService`: Updated `Player` interface to include `name`.
  - `LobbyService`: Implemented **Auto-Rename** strategy for duplicate usernames (e.g., `User (1)`).
  - `LobbyGateway`: Updated `createRoom` and `joinRoom` to accept/broadcast player names.
- **Frontend**:
  - `Menu`: Added "Profile" item and "Edit Profile" Modal.
  - `LobbyPage`:
    - Fetch user profile on mount (fixed issue with stale JWT data).
    - Pass `userName` when creating/joining rooms.
    - Display `player.name` in the player list.
    - Display Host's **Name** correctly instead of ID.
    - Added **Leave Room** button.

## Testing
- [x] Can modify display name in Menu -> Profile.
- [x] Name persists across page loads (via `PATCH /me`).
- [x] Duplicate names are auto-renamed (e.g., `gd` -> `gd (1)`).
- [x] Host name shows correctly in Lobby.
- [x] Can leave room using "Leave Room" button.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Conventional commits used.
