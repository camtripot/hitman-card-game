import { io, Socket } from 'socket.io-client';
import { GamePhase } from '../models/GameState';
import { PlayerAction } from '../models/Actions';
import { GameManager } from './GameManagerInterface';

// The server sends a filtered state (no other players' hands)
export interface OnlineGameState {
  id: string;
  players: {
    id: string;
    name: string;
    cardCount: number;
    isEliminated: boolean;
    isConnected: boolean;
    hand?: any[];
  }[];
  drawPileCount: number;
  discardPile: any[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  phase: GamePhase;
  chainedCards: any[];
  turnCount: number;
  mustPlayCount: number;
  reactionWindow: {
    eligiblePlayerIds: string[];
    passedPlayerIds: string[];
    timeoutMs: number;
    startedAt: number;
  } | null;
  lastEvent: any;
  winner: string | null;
  voyanteCards: any[];
  lastPlayedCardType: string | null;
  eliminatedPlayerId: string | null;
}

export interface RoomInfo {
  players: { id: string; name: string; isConnected: boolean }[];
  hostId: string;
  status: string;
}

type OnlineListener = (state: OnlineGameState) => void;
type RoomListener = (room: RoomInfo) => void;
type ErrorListener = (error: string) => void;

// Auto-detect: use production URL if not on localhost, otherwise use local dev server
const SERVER_URL = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? 'https://hitman-card-game.onrender.com'
    : 'http://localhost:3001';

export class OnlineGameManager {
  private socket: Socket | null = null;
  private playerId: string = '';
  private roomCode: string = '';
  private gameState: OnlineGameState | null = null;
  private stateListeners: Set<OnlineListener> = new Set();
  private roomListeners: Set<RoomListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('game_state', (state: OnlineGameState) => {
      this.gameState = state;
      this.stateListeners.forEach(l => l(state));
    });

    this.socket.on('room_updated', (room: RoomInfo) => {
      this.roomListeners.forEach(l => l(room));
    });

    this.socket.on('game_over', (data: { winnerId: string }) => {
      // Game over is already reflected in game_state
    });

    this.socket.on('player_disconnected', (data: { playerId: string }) => {
      console.log(`Player ${data.playerId} disconnected`);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  async createRoom(playerName: string): Promise<{ roomCode: string; playerId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Not connected');
        return;
      }

      this.socket.emit('create_room', { playerName }, (response: any) => {
        if (response.success) {
          this.playerId = response.playerId;
          this.roomCode = response.roomCode;
          resolve({ roomCode: response.roomCode, playerId: response.playerId });
        } else {
          reject(response.error);
        }
      });
    });
  }

  async joinRoom(roomCode: string, playerName: string): Promise<{ playerId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Not connected');
        return;
      }

      this.socket.emit('join_room', { roomCode, playerName }, (response: any) => {
        if (response.success) {
          this.playerId = response.playerId;
          this.roomCode = response.roomCode;
          resolve({ playerId: response.playerId });
        } else {
          reject(response.error);
        }
      });
    });
  }

  async startGame(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Not connected');
        return;
      }

      this.socket.emit('start_game', (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(response.error);
        }
      });
    });
  }

  dispatch(action: PlayerAction): void {
    if (!this.socket) return;

    const serverAction = { ...action, playerId: this.playerId };

    this.socket.emit('game_action', { action: serverAction }, (response: any) => {
      if (!response.success) {
        this.errorListeners.forEach(l => l(response.error || 'Action invalide'));
      }
    });
  }

  onStateChange(listener: OnlineListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  onRoomUpdate(listener: RoomListener): () => void {
    this.roomListeners.add(listener);
    return () => this.roomListeners.delete(listener);
  }

  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  getPlayerId(): string {
    return this.playerId;
  }

  getRoomCode(): string {
    return this.roomCode;
  }

  getGameState(): OnlineGameState | null {
    return this.gameState;
  }

  leaveRoom(): void {
    this.socket?.emit('leave_room');
    this.roomCode = '';
    this.playerId = '';
    this.gameState = null;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.stateListeners.clear();
    this.roomListeners.clear();
    this.errorListeners.clear();
  }
}
