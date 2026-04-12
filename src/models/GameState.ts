import { Card, CardType } from './Card';
import { Player } from './Player';

export enum GamePhase {
  WAITING_FOR_TURN_ACTION = 'waiting_for_turn_action',
  DRAWING = 'drawing',
  RESOLVING_CARD = 'resolving_card',
  REACTION_WINDOW = 'reaction_window',
  AWAITING_TARGET = 'awaiting_target',
  AWAITING_CARD_CHOICE = 'awaiting_card_choice',
  APPLYING_EFFECT = 'applying_effect',
  PLAYER_ELIMINATED = 'player_eliminated',
  VIEWING_VOYANTE = 'viewing_voyante',
  GAME_OVER = 'game_over',
}

export interface PendingEffect {
  sourcePlayerId: string;
  cardType: CardType;
  cardInstanceId: string;
  targetPlayerId?: string;
  resolved: boolean;
}

export interface ChainEntry {
  cardType: CardType;
  turnsRemaining: number;
}

export interface ReactionWindowState {
  forEffect: PendingEffect;
  eligiblePlayerIds: string[];
  passedPlayerIds: string[];
  timeoutMs: number;
  startedAt: number;
}

export interface GameEvent {
  type: string;
  playerId?: string;
  cardType?: CardType;
  targetPlayerId?: string;
  message: string;
}

export interface GameConfig {
  playerNames: string[];
  reactionTimeoutMs: number;
  cardsPerPlayer: number;
}

export interface GameState {
  id: string;
  players: Player[];
  drawPile: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  phase: GamePhase;
  effectStack: PendingEffect[];
  chainedCards: ChainEntry[];
  turnCount: number;
  mustPlayCount: number;
  reactionWindow: ReactionWindowState | null;
  lastEvent: GameEvent | null;
  winner: string | null;
  voyanteCards: Card[];
  lastPlayedCardType: CardType | null;
  eliminatedPlayerId: string | null;
}

export const DEFAULT_CONFIG: GameConfig = {
  playerNames: [],
  reactionTimeoutMs: 10000,
  cardsPerPlayer: 4,
};
