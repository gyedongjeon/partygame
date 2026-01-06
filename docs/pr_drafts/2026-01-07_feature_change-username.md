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
  - `LobbyGateway`: Updated `createRoom` and `joinRoom` to accept/broadcast player names.
- **Frontend**:
  - `Menu`: Added "Profile" item and "Edit Profile" Modal.
  - `LobbyPage`:
    - Fetch user profile on mount.
    - Pass `userName` when creating/joining rooms.
    - Display `player.name` in the player list.

## Testing
- [x] Can modify display name in Menu -> Profile.
- [x] Name persists across page loads (via API).
- [x] Host name shows in Lobby.
- [x] Guest name shows in Lobby.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Conventional commits used.
