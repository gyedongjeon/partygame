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
import { LobbyService } from './lobby.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for dev
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
    // Ideally, we handle cleanup here (remove user from room if they disconnect)
    // But for now, we leave it manual or implement later
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.lobbyService.createRoom(data.userId, client.id);
    client.join(room.id);
    return { event: 'roomCreated', data: room };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const room = this.lobbyService.joinRoom(data.roomId, data.userId, client.id);
      client.join(room.id);
      this.server.to(room.id).emit('playerJoined', room);
      return { event: 'roomJoined', data: room };
    } catch (error) {
      return { event: 'error', data: error.message };
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.lobbyService.leaveRoom(data.roomId, data.userId);
    client.leave(data.roomId);
    if (room) {
      this.server.to(room.id).emit('playerLeft', room);
    }
    return { event: 'leftRoom', data: { roomId: data.roomId } };
  }
}
