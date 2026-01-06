# PR Title: feat: implement lobby system with socket.io

## Summary
Implemented a real-time **Lobby System** using Socket.io. Users can now create rooms and join them using a room code.
- **Backend Setup**: Added `LobbyModule` and `LobbyGateway`.
- **Frontend Integration**: Added `useSocket` hook and Lobby UI pages.

## Technical Changes
- **Backend**:
    - Installed `@nestjs/websockets`, `@nestjs/platform-socket.io`.
    - `LobbyService`: Manages in-memory room state (`Map<string, Room>`).
    - `LobbyGateway`: Handles `createRoom`, `joinRoom`, `leaveRoom` events.
- **Frontend**:
    - Installed `socket.io-client`.
    - `useSocket.ts`: Manages singleton socket connection.
    - `/lobby`: UI to create (generates random ID) or join rooms.
    - `/lobby/[id]`: Active room view showing real-time player list.

## Test Report
- [x] Backend builds successfully (`npm run build`).
- [x] Frontend builds successfully (`npm run build`).
- [x] Room Creation: Verified user is redirected to `/lobby/[id]`.
- [x] Room Joining: Verified second user appears in player list instantly.
- [x] Multi-user Test: Confirmed unique User IDs via `sessionStorage`.

## Checklist
- [x] Code follows "Tidy First" principles.
- [x] Unit tests included (scaffolds) - *Note: Full test coverage to be added in `test/` phase.*
- [x] No breaking changes.
