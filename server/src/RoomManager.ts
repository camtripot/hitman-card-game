export interface RoomPlayer {
  id: string;
  name: string;
  socketId: string;
  isConnected: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  players: RoomPlayer[];
  status: 'lobby' | 'playing' | 'finished';
  createdAt: number;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostName: string, socketId: string): Room {
    const code = this.generateCode();
    const hostId = this.generatePlayerId();
    const room: Room = {
      code,
      hostId,
      players: [{
        id: hostId,
        name: hostName,
        socketId,
        isConnected: true,
      }],
      status: 'lobby',
      createdAt: Date.now(),
    };
    this.rooms.set(code, room);
    return room;
  }

  joinRoom(code: string, playerName: string, socketId: string): { room: Room; playerId: string } | null {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return null;
    if (room.status !== 'lobby') return null;
    if (room.players.length >= 10) return null;

    const playerId = this.generatePlayerId();
    room.players.push({
      id: playerId,
      name: playerName,
      socketId,
      isConnected: true,
    });
    return { room, playerId };
  }

  reconnectPlayer(code: string, playerId: string, socketId: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    player.socketId = socketId;
    player.isConnected = true;
    return room;
  }

  disconnectPlayer(socketId: string): { room: Room; playerId: string } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.isConnected = false;
        return { room, playerId: player.id };
      }
    }
    return null;
  }

  leaveRoom(socketId: string): { room: Room; playerId: string } | null {
    for (const room of this.rooms.values()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socketId);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        if (room.status === 'lobby') {
          room.players.splice(playerIndex, 1);
          // If host left, assign new host or delete room
          if (player.id === room.hostId) {
            if (room.players.length > 0) {
              room.hostId = room.players[0].id;
            } else {
              this.rooms.delete(room.code);
            }
          }
        } else {
          player.isConnected = false;
        }
        return { room, playerId: player.id };
      }
    }
    return null;
  }

  getRoom(code: string): Room | null {
    return this.rooms.get(code.toUpperCase()) || null;
  }

  setRoomStatus(code: string, status: Room['status']): void {
    const room = this.rooms.get(code);
    if (room) room.status = status;
  }

  getPlayerBySocket(socketId: string): { room: Room; player: RoomPlayer } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) return { room, player };
    }
    return null;
  }

  deleteRoom(code: string): void {
    this.rooms.delete(code);
  }

  // Clean up old empty rooms (call periodically)
  cleanup(): void {
    const oneHour = 60 * 60 * 1000;
    for (const [code, room] of this.rooms.entries()) {
      if (Date.now() - room.createdAt > oneHour && room.status === 'finished') {
        this.rooms.delete(code);
      }
      if (room.players.every(p => !p.isConnected) && Date.now() - room.createdAt > oneHour) {
        this.rooms.delete(code);
      }
    }
  }

  private generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }
}
