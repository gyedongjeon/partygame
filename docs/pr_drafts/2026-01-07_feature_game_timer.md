# Feature: Game Duration Timer

## Summary
Implemented a countdown timer that displays during gameplay when the "Time Limit" setting is enabled. Also fixed the vote button not responding.

## Changes

### Backend (`lobby.service.ts`)
- Added `endTime` property to `Room` interface
- Added `handleGameTimeout` method to handle automatic game ending
- Updated `startGame` to accept an optional `onTimeout` callback and calculate `endTime`

### Backend (`lobby.gateway.ts`)
- Updated `handleStartGame` to pass timeout callback to service
- Now emits `endTime` to clients in `gameStarted` event
- Automatically emits `gameEnded` when timer expires
- **Fixed**: Added `client.emit('voteAccepted')` to fix vote button not responding

### Frontend (`lobby/[id]/page.tsx`)
- Added `endTime` and `timeLeft` state variables
- Added `useEffect` hook to calculate remaining time every 500ms
- Displays countdown timer (⏱ 45s) below the Secret Word
- Timer turns red and pulses when ≤10 seconds remain
- Shows "(No time limit set)" when timer is disabled for clarity

## Testing
- [x] Timer appears when Time Limit is ON
- [x] Timer counts down correctly
- [x] Timer turns red at 10 seconds
- [x] Game automatically ends when timer expires (Imposter wins)
- [x] Vote button shows "Vote Cast! Waiting for others..." after clicking
