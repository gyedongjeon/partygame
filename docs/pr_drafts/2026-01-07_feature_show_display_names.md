# Feature: Show Display Names in Voting

## Summary
Updated the Game Room UI to display player names instead of internal User IDs (UUIDs) during voting and on the Game Over screen.

## Changes
- **Frontend (Vote List)**: Render `p.name` instead of `p.id` in the voting list.
- **Frontend (Game Over)**: Lookup and display the name of the Imposter using the `imposterId`.

## Testing
- [x] Verified that names appear in the voting list.
- [x] Verified "The Imposter was: [Name]" appears correctly.
