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

  /** Attend que le socket soit connecté (max timeoutMs ms) */
  waitForConnection(timeoutMs = 60000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) { resolve(); return; }
      const timer = setTimeout(() => {
        reject('Serveur injoignable. Réessaie dans quelques secondes (Render peut mettre ~60s à démarrer).');
      }, timeoutMs);
      // On écoute seulement "connect" — on laisse socket.io gérer les retries/fallbacks
      const onConnect = () => { clearTimeout(timer); resolve(); };
      this.socket?.once('connect', onConnect);
    });
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(SERVER_URL, {
      // Polling d'abord : plus fiable sur Render, puis upgrade vers WebSocket
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
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
    await this.waitForConnection();
    return new Promise((resolve, reject) => {
      if (!this.socket) { reject('Non connecté'); return; }
      const timer = setTimeout(() => reject('Pas de réponse du serveur'), 15000);
      this.socket.emit('create_room', { playerName }, (response: any) => {
        clearTimeout(timer);
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
    await this.waitForConnection();
    return new Promise((resolve, reject) => {
      if (!this.socket) { reject('Non connecté'); return; }
      const timer = setTimeout(() => reject('Pas de réponse du serveur'), 15000);
      this.socket.emit('join_room', { roomCode, playerName }, (response: any) => {
        clearTimeout(timer);
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

  async startGame(settings?: { startWithAnge: boolean; deadCardsReturnToPile: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('Not connected');
        return;
      }

      this.socket.emit('start_game', { settings }, (response: any) => {
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
