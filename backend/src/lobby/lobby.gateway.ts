import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameSettings, LobbyService } from './lobby.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly lobbyService: LobbyService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() data: { userId: string; name: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      `[createRoom] Request from ${data.userId} (socket: ${client.id})`,
    );
    try {
      const room = this.lobbyService.createRoom(
        data.userId,
        client.id,
        data.name,
      );
      await client.join(room.id);
      console.log(`[createRoom] Room created: ${room.id}`);
      return { type: 'roomCreated', data: { id: room.id } };
    } catch (error) {
      console.error(`[createRoom] Error:`, error);
      return { type: 'error', data: (error as Error).message };
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: string; name: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const room = this.lobbyService.joinRoom(
        data.roomId,
        data.userId,
        client.id,
        data.name,
      );
      await client.join(room.id);
      this.server.to(room.id).emit('playerJoined', room);
      return { type: 'roomJoined', data: room };
    } catch (error) {
      return { type: 'error', data: (error as Error).message };
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.lobbyService.leaveRoom(data.roomId, data.userId);
    await client.leave(data.roomId);
    if (room) {
      this.server.to(room.id).emit('playerLeft', room);
    }
    return { type: 'leftRoom', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('startGame')
  handleStartGame(@MessageBody() data: { roomId: string; userId: string }) {
    try {
      const room = this.lobbyService.startGame(
        data.roomId,
        data.userId,
        (timeoutRoomId) => {
          // Callback when time expires
          const { room: updatedRoom, result } =
            this.lobbyService.handleGameTimeout(timeoutRoomId);
          if (updatedRoom && result) {
            this.server.to(updatedRoom.id).emit('gameEnded', result);
          }
        },
      );

      room.players.forEach((player) => {
        const isImposter = player.id === room.imposterId;
        const secret = isImposter
          ? 'YOU ARE THE IMPOSTER'
          : `Secret Word: ${room.word}`;
        this.server.to(player.socketId).emit('gameStarted', {
          gameState: room.gameState,
          role: isImposter ? 'imposter' : 'civilian',
          secret,
          endTime: room.endTime, // Send endTime to clients
        });
      });

      return { type: 'gameStarted', data: { success: true } };
    } catch (error) {
      return { type: 'error', data: (error as Error).message };
    }
  }

  @SubscribeMessage('vote')
  handleVote(
    @MessageBody() data: { roomId: string; userId: string; targetId: string },
  ) {
    try {
      const { room, result } = this.lobbyService.vote(
        data.roomId,
        data.userId,
        data.targetId,
      );

      if (result) {
        this.server.to(room.id).emit('gameEnded', result);
      }

      return { type: 'voteAccepted', data: { success: true } };
    } catch (error) {
      return { type: 'error', data: (error as Error).message };
    }
  }

  @SubscribeMessage('updateSettings')
  handleUpdateSettings(
    @MessageBody()
    data: {
      roomId: string;
      userId: string;
      settings: Partial<GameSettings>;
    },
  ) {
    try {
      const room = this.lobbyService.updateSettings(
        data.roomId,
        data.userId,
        data.settings,
      );
      this.server.to(room.id).emit('settingsUpdated', room.settings);
      return { type: 'settingsUpdated', data: { success: true } };
    } catch (error) {
      return { type: 'error', data: (error as Error).message };
    }
  }
}
