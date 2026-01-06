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
}
