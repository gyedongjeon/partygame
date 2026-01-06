import { Test, TestingModule } from '@nestjs/testing';
import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
  let service: LobbyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LobbyService],
    }).compile();

    service = module.get<LobbyService>(LobbyService);
  });

  describe('startGame', () => {
    it('should start game successfully', () => {
      const room = service.createRoom('host', 'socket1');
      service.joinRoom(room.id, 'player2', 'socket2');

      const startedRoom = service.startGame(room.id, 'host');
      expect(startedRoom.gameState).toBe('playing');
      expect(startedRoom.word).toBeDefined();
      expect(startedRoom.imposterId).toBeDefined();
    });

    it('should fail if not host', () => {
      const room = service.createRoom('host', 'socket1');
      service.joinRoom(room.id, 'player2', 'socket2');
      expect(() => service.startGame(room.id, 'player2')).toThrow(
        'Only host can start game',
      );
    });
  });

  describe('vote', () => {
    it('should determine winner correctly', () => {
      const room = service.createRoom('host', 'socket1');
      service.joinRoom(room.id, 'player2', 'socket2');
      service.startGame(room.id, 'host');

      const imposterId = room.imposterId!;
      const civilianId = room.players.find((p) => p.id !== imposterId)!.id;

      // Vote for imposter (Civilians should win)
      service.vote(room.id, imposterId, imposterId); // Imposter votes for self (weird but valid)
      const { result } = service.vote(room.id, civilianId, imposterId); // Civilian votes for imposter

      expect(result).toBeDefined();
      expect(result!.winner).toBe('civilians');
      expect(result!.imposterId).toBe(imposterId);
    });
  });
});
