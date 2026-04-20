import { Server, Socket } from 'socket.io';
import { RoomManager } from './RoomManager';
import { ServerGameEngine } from './ServerGameEngine';
import { PlayerAction } from '../../src/models/Actions';

const roomManager = new RoomManager();
const gameEngines: Map<string, ServerGameEngine> = new Map();

export function setupSocketHandlers(io: Server): void {
  // Cleanup old rooms every 10 minutes
  setInterval(() => roomManager.cleanup(), 10 * 60 * 1000);

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // --- CREATE ROOM ---
    socket.on('create_room', (data: { playerName: string }, callback) => {
      const { playerName } = data;
      if (!playerName || playerName.trim().length === 0) {
        callback({ success: false, error: 'Nom de joueur requis' });
        return;
      }

      const room = roomManager.createRoom(playerName.trim(), socket.id);
      socket.join(room.code);

      callback({
        success: true,
        roomCode: room.code,
        playerId: room.hostId,
      });

      // Notify the host about the room (so LobbyScreen updates)
      io.to(room.code).emit('room_updated', {
        players: room.players.map(p => ({
          id: p.id,
          name: p.name,
          isConnected: p.isConnected,
        })),
        hostId: room.hostId,
        status: room.status,
      });

      console.log(`Room ${room.code} created by ${playerName}`);
    });

    // --- JOIN ROOM ---
    socket.on('join_room', (data: { roomCode: string; playerName: string }, callback) => {
      const { roomCode, playerName } = data;
      if (!roomCode || !playerName) {
        callback({ success: false, error: 'Code de salon et nom requis' });
        return;
      }

      const result = roomManager.joinRoom(roomCode, playerName.trim(), socket.id);
      if (!result) {
        callback({ success: false, error: 'Salon introuvable, plein ou partie en cours' });
        return;
      }

      socket.join(result.room.code);

      callback({
        success: true,
        roomCode: result.room.code,
        playerId: result.playerId,
      });

      // Notify all players in the room
      io.to(result.room.code).emit('room_updated', {
        players: result.room.players.map(p => ({
          id: p.id,
          name: p.name,
          isConnected: p.isConnected,
        })),
        hostId: result.room.hostId,
        status: result.room.status,
      });

      console.log(`${playerName} joined room ${roomCode}`);
    });

    // --- START GAME ---
    socket.on('start_game', (data: any, callback: any) => {
      // Handle both (callback) and (data, callback) signatures
      if (typeof data === 'function') {
        callback = data;
        data = {};
      }
      const found = roomManager.getPlayerBySocket(socket.id);
      if (!found) {
        callback({ success: false, error: 'Salon introuvable' });
        return;
      }

      const { room, player } = found;

      if (player.id !== room.hostId) {
        callback({ success: false, error: 'Seul le host peut lancer la partie' });
        return;
      }

      if (room.players.length < 2) {
        callback({ success: false, error: 'Il faut au moins 2 joueurs' });
        return;
      }

      roomManager.setRoomStatus(room.code, 'playing');

      const engine = new ServerGameEngine();
      const playerNames = room.players.map(p => p.name);
      const playerIds = room.players.map(p => p.id);
      const settings = data?.settings;
      engine.startGame(playerNames, playerIds, settings);

      // When state changes, broadcast to all players
      engine.setOnStateChange((_state) => {
        broadcastGameState(io, room.code, engine);
      });

      gameEngines.set(room.code, engine);

      callback({ success: true });

      // Send initial state to each player
      broadcastGameState(io, room.code, engine);

      console.log(`Game started in room ${room.code}`);
    });

    // --- GAME ACTION ---
    socket.on('game_action', (data: { action: PlayerAction }, callback) => {
      const found = roomManager.getPlayerBySocket(socket.id);
      if (!found) {
        callback({ success: false, error: 'Salon introuvable' });
        return;
      }

      const { room, player } = found;
      const engine = gameEngines.get(room.code);
      if (!engine) {
        callback({ success: false, error: 'Partie non démarrée' });
        return;
      }

      // Ensure the action is from the correct player
      const action = { ...data.action, playerId: player.id };
      const result = engine.applyAction(player.id, action);

      callback(result);

      if (result.success) {
        // State change is broadcast via the onStateChange callback
        // Check for game over
        if (engine.isGameOver()) {
          roomManager.setRoomStatus(room.code, 'finished');
          io.to(room.code).emit('game_over', {
            winnerId: engine.getFullState()?.winner,
          });
        }
      }
    });

    // --- LEAVE ROOM ---
    socket.on('leave_room', () => {
      handleLeave(io, socket);
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      const result = roomManager.disconnectPlayer(socket.id);
      if (result) {
        io.to(result.room.code).emit('player_disconnected', {
          playerId: result.playerId,
        });
        io.to(result.room.code).emit('room_updated', {
          players: result.room.players.map(p => ({
            id: p.id,
            name: p.name,
            isConnected: p.isConnected,
          })),
          hostId: result.room.hostId,
          status: result.room.status,
        });
      }
    });

    // --- RECONNECT ---
    socket.on('reconnect_room', (data: { roomCode: string; playerId: string }, callback) => {
      const room = roomManager.reconnectPlayer(data.roomCode, data.playerId, socket.id);
      if (!room) {
        callback({ success: false, error: 'Impossible de se reconnecter' });
        return;
      }

      socket.join(room.code);
      callback({ success: true });

      io.to(room.code).emit('room_updated', {
        players: room.players.map(p => ({
          id: p.id,
          name: p.name,
          isConnected: p.isConnected,
        })),
        hostId: room.hostId,
        status: room.status,
      });

      // Send current game state if game is in progress
      const engine = gameEngines.get(room.code);
      if (engine) {
        const player = room.players.find(p => p.id === data.playerId);
        if (player) {
          const filteredState = engine.getFilteredState(player.id);
          socket.emit('game_state', filteredState);
        }
      }
    });
  });
}

function broadcastGameState(io: Server, roomCode: string, engine: ServerGameEngine): void {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  for (const player of room.players) {
    const filteredState = engine.getFilteredState(player.id);
    io.to(player.socketId).emit('game_state', filteredState);
  }
}

function handleLeave(io: Server, socket: Socket): void {
  const result = roomManager.leaveRoom(socket.id);
  if (result) {
    socket.leave(result.room.code);
    io.to(result.room.code).emit('room_updated', {
      players: result.room.players.map(p => ({
        id: p.id,
        name: p.name,
        isConnected: p.isConnected,
      })),
      hostId: result.room.hostId,
      status: result.room.status,
    });
  }
}
