import { GameState } from '../models/GameState';
import { PlayerAction } from '../models/Actions';

export interface GameManager {
  initialize(playerNames: string[]): void;
  dispatch(action: PlayerAction): void;
  subscribe(listener: (state: GameState) => void): () => void;
  getState(): GameState;
  getMyPlayerId(): string;
  destroy(): void;
}
