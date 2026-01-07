# PR: Imposter Game Settings

## Summary
Implemented game configuration settings for the "Imposter Game", allowing the host to customize the experience.

## Changes
- **Backend**:
  - `LobbyService`: Added `GameSettings` to `Room` interface and `updateSettings` method with validation.
  - `LobbyGateway`: Added `updateSettings` handler and `settingsUpdated` event broadcast.
- **Frontend**:
  - `LobbyPage`: Added "Game Settings" panel (Host-only).
  - UI includes:
    - Max Players (2-16)
    - Imposter Count (validated < Max Players)
    - Time Limit (On/Off + Duration)
  - Real-time updates via WebSocket.

## Testing
- [x] Host can modify settings.
- [x] Settings sync to all players in real-time.
- [x] Validation prevents invalid configurations (e.g. invalid player counts).

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Conventional commits used.
