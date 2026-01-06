# PR Title: feat: Implement Imposter Game Logic and Voting System

## Summary
This PR implements the core gameplay mechanics for the "Imposter Game" mode. It includes the backend logic for game states, role assignment, and voting, as well as the frontend UI for playing the game in the lobby.

## Technical Changes
-   **Backend (`LobbyService`)**:
    -   Added `gameState` ('waiting', 'playing', 'finished'), `word`, `imposterId`, and `votes` to `Room` interface.
    -   Implemented `startGame`:
        -   Validation (only host, min 2 players).
        -   Role assignment (1 random Imposter).
        -   Word selection from a predefined list.
    -   Implemented `vote`:
        -   Tracks votes per player.
        -   Determines winner when all players voted (Imposter wins if not caught; Civilians win if Imposter caught).
-   **Backend (`LobbyGateway`)**:
    -   Added `startGame` event: broadcasts unique data to each player (Civilians see word, Imposter sees "You are Imposter").
    -   Added `vote` event: handles incoming votes and broadcasts `gameEnded` if voting concludes.
-   **Frontend (`RoomPage`)**:
    -   Added game state management (`waiting`, `playing`, `finished`).
    -   Displayed Role and Secret Word (or Imposter warning).
    -   Implemented Voting UI (list of players with Vote buttons).
    -   Added Game Over screen with Winner declaration and "Play Again" button for host.
    -   Fixed `react-hooks/set-state-in-effect` linting issues.

## Test Report
-   [x] **Unit Tests**: Added tests for `LobbyService` covering:
    -   `startGame` (success, host validation).
    -   `vote` (counting logic, win condition for Civilians vs Imposter).
-   [x] **Linting**: Passed `npm run lint` for both backend and frontend.

## Checklist
-   [x] Code follows "Tidy First" principles.
-   [x] Unit tests included and passing.
-   [x] Commit messages follow Conventional Commits.
