import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Player {
  id: string;
  socketId: string;
  // Add more player info as needed (name, avatar, etc.)
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  createdAt: Date;
  gameState: 'waiting' | 'playing' | 'finished';
  word?: string;
  imposterId?: string;
  votes?: Record<string, string>; // voterId -> targetId
}

@Injectable()
export class LobbyService {
  private rooms: Map<string, Room> = new Map();

  createRoom(hostId: string, hostSocketId: string): Room {
    const roomId = uuidv4().slice(0, 6).toUpperCase(); // Short ID for easy sharing
    const newRoom: Room = {
      id: roomId,
      hostId,
      players: [{ id: hostId, socketId: hostSocketId }],
      createdAt: new Date(),
      gameState: 'waiting',
    };
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  joinRoom(roomId: string, playerId: string, socketId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Prevent duplicate join
    const existingPlayer = room.players.find((p) => p.id === playerId);
    if (!existingPlayer) {
      room.players.push({ id: playerId, socketId });
    } else {
      // Update socket ID on reconnect
      existingPlayer.socketId = socketId;
    }

    return room;
  }

  leaveRoom(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter((p) => p.id !== playerId);

    // If empty, delete room
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    // If host left, assign new host
    if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
    }

    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  private words = [
    'Apple',
    'Banana',
    'Computer',
    'Elephant',
    'Guitar',
    'Moon',
    'Pizza',
  ];

  startGame(roomId: string, playerId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (room.hostId !== playerId) {
      throw new Error('Only host can start game');
    }
    if (room.players.length < 2) {
      throw new Error('Need at least 2 players');
    }

    room.gameState = 'playing';
    room.word = this.words[Math.floor(Math.random() * this.words.length)];
    const imposterIndex = Math.floor(Math.random() * room.players.length);
    room.imposterId = room.players[imposterIndex].id;
    room.votes = {};

    return room;
  }

  vote(
    roomId: string,
    voterId: string,
    targetId: string,
  ): {
    room: Room;
    result?: { winner: 'imposter' | 'civilians'; imposterId: string };
  } {
    const room = this.rooms.get(roomId);
    if (!room) throw new NotFoundException('Room not found');
    if (room.gameState !== 'playing') throw new Error('Game not in progress');
    if (!room.votes) room.votes = {};

    // Record vote
    room.votes[voterId] = targetId;

    // Check if all players voted
    const totalPlayers = room.players.length;
    const totalVotes = Object.keys(room.votes).length;

    if (totalVotes === totalPlayers) {
      // Count votes
      const voteCounts: Record<string, number> = {};
      Object.values(room.votes).forEach((target) => {
        voteCounts[target] = (voteCounts[target] || 0) + 1;
      });

      // Find valid max vote
      let maxVotes = 0;
      let targetWithMaxVotes: string | null = null;

      Object.entries(voteCounts).forEach(([target, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          targetWithMaxVotes = target;
        } else if (count === maxVotes) {
          targetWithMaxVotes = null; // Tie
        }
      });

      room.gameState = 'finished';
      const winner =
        targetWithMaxVotes === room.imposterId ? 'civilians' : 'imposter';

      return {
        room,
        result: {
          winner,
          imposterId: room.imposterId!,
        },
      };
    }

    return { room };
  }
}
