import { GameState, GamePhase, ChainEntry, GameEvent } from '../../src/models/GameState';
import { PlayerAction } from '../../src/models/Actions';
import { Card, CardType } from '../../src/models/Card';
import { GameEngine } from '../../src/engine/GameEngine';
import { RoomPlayer } from './RoomManager';

export interface FilteredGameState {
  id: string;
  players: {
    id: string;
    name: string;
    cardCount: number;
    isEliminated: boolean;
    isConnected: boolean;
    hand?: Card[];
  }[];
  drawPileCount: number;
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  phase: GamePhase;
  chainedCards: ChainEntry[];
  turnCount: number;
  mustPlayCount: number;
  reactionWindow: {
    eligiblePlayerIds: string[];
    passedPlayerIds: string[];
    timeoutMs: number;
    startedAt: number;
  } | null;
  lastEvent: GameEvent | null;
  winner: string | null;
  voyanteCards: Card[];
  lastPlayedCardType: CardType | null;
  eliminatedPlayerId: string | null;
  isAwaitingCardChoice: boolean;
  pendingHitmanCard: Card | null;
}

export class ServerGameEngine {
  private state: GameState | null = null;
  private reactionTimer: ReturnType<typeof setTimeout> | null = null;
  private onStateChange: ((state: GameState) => void) | null = null;

  startGame(playerNames: string[], playerIds: string[], settings?: { startWithAnge: boolean; deadCardsReturnToPile: boolean }): GameState {
    const state = GameEngine.createGame({ playerNames, ...(settings || {}) });

    // Override generated player IDs with the ones from the room
    const newPlayers = state.players.map((p, i) => ({
      ...p,
      id: playerIds[i],
    }));

    this.state = { ...state, players: newPlayers };
    return this.state;
  }

  setOnStateChange(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }

  applyAction(playerId: string, action: PlayerAction): { success: boolean; error?: string } {
    if (!this.state) return { success: false, error: 'Game not started' };

    // Validate: is this player allowed to do this?
    const validActions = GameEngine.getValidActions(this.state, playerId);
    const isValid = validActions.some(a => {
      if (a.type !== action.type) return false;
      if (a.playerId !== action.playerId) return false;
      if ('cardInstanceId' in a && 'cardInstanceId' in action) {
        return a.cardInstanceId === action.cardInstanceId;
      }
      if ('targetPlayerId' in a && 'targetPlayerId' in action) {
        return a.targetPlayerId === action.targetPlayerId;
      }
      return true;
    });

    if (!isValid) {
      return { success: false, error: 'Invalid action' };
    }

    this.state = GameEngine.dispatch(this.state, action);

    // Start reaction timer if we entered reaction window
    this.handleReactionTimer();

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }

    return { success: true };
  }

  getFilteredState(forPlayerId: string): FilteredGameState | null {
    if (!this.state) return null;

    const currentPlayer = this.state.players[this.state.currentPlayerIndex];

    return {
      id: this.state.id,
      players: this.state.players.map(p => ({
        id: p.id,
        name: p.name,
        cardCount: p.hand.length,
        isEliminated: p.isEliminated,
        isConnected: p.isConnected,
        // Only send hand to the requesting player
        hand: p.id === forPlayerId ? p.hand : undefined,
      })),
      drawPileCount: this.state.drawPile.length,
      discardPile: this.state.discardPile,
      currentPlayerIndex: this.state.currentPlayerIndex,
      direction: this.state.direction,
      phase: this.state.phase,
      chainedCards: this.state.chainedCards,
      turnCount: this.state.turnCount,
      mustPlayCount: this.state.mustPlayCount,
      reactionWindow: this.state.reactionWindow ? {
        eligiblePlayerIds: this.state.reactionWindow.eligiblePlayerIds,
        passedPlayerIds: this.state.reactionWindow.passedPlayerIds,
        timeoutMs: this.state.reactionWindow.timeoutMs,
        startedAt: this.state.reactionWindow.startedAt,
      } : null,
      lastEvent: this.state.lastEvent,
      winner: this.state.winner,
      // Only show voyante cards to the current player
      voyanteCards: forPlayerId === currentPlayer?.id ? this.state.voyanteCards : [],
      lastPlayedCardType: this.state.lastPlayedCardType,
      eliminatedPlayerId: this.state.eliminatedPlayerId,
      isAwaitingCardChoice: GameEngine.getValidActions(this.state, forPlayerId).some(a => a.type === 'CHOOSE_CARD_TO_GIVE'),
      // Visible uniquement pour le joueur qui doit placer le Hitman
      pendingHitmanCard: forPlayerId === currentPlayer?.id ? this.state.pendingHitmanCard : null,
    };
  }

  getFullState(): GameState | null {
    return this.state;
  }

  isGameOver(): boolean {
    return this.state?.phase === GamePhase.GAME_OVER;
  }

  destroy(): void {
    if (this.reactionTimer) {
      clearTimeout(this.reactionTimer);
      this.reactionTimer = null;
    }
  }

  private handleReactionTimer(): void {
    if (this.reactionTimer) {
      clearTimeout(this.reactionTimer);
      this.reactionTimer = null;
    }

    if (!this.state || this.state.phase !== GamePhase.REACTION_WINDOW || !this.state.reactionWindow) {
      return;
    }

    const timeout = this.state.reactionWindow.timeoutMs;

    this.reactionTimer = setTimeout(() => {
      if (!this.state || this.state.phase !== GamePhase.REACTION_WINDOW || !this.state.reactionWindow) {
        return;
      }

      // Auto-pass for all remaining eligible players
      const eligible = this.state.reactionWindow.eligiblePlayerIds;
      const passed = this.state.reactionWindow.passedPlayerIds;

      for (const playerId of eligible) {
        if (!passed.includes(playerId) && this.state.phase === GamePhase.REACTION_WINDOW) {
          this.state = GameEngine.dispatch(this.state, {
            type: 'PASS_REACTION',
            playerId,
          });
        }
      }

      if (this.onStateChange && this.state) {
        this.onStateChange(this.state);
      }
    }, timeout);
  }
}
