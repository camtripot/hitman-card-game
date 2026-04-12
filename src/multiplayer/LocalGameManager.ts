import { GameState } from '../models/GameState';
import { PlayerAction } from '../models/Actions';
import { GameEngine } from '../engine/GameEngine';
import { GameManager } from './GameManagerInterface';

export class LocalGameManager implements GameManager {
  private state: GameState = {} as GameState;
  private listeners: Set<(state: GameState) => void> = new Set();

  initialize(playerNames: string[]): void {
    this.state = GameEngine.createGame({ playerNames });
    this.notifyListeners();
  }

  dispatch(action: PlayerAction): void {
    this.state = GameEngine.dispatch(this.state, action);
    this.notifyListeners();
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): GameState {
    return this.state;
  }

  getMyPlayerId(): string {
    // In local mode, the current player is always "you"
    return this.state.players[this.state.currentPlayerIndex]?.id ?? '';
  }

  getValidActions(): PlayerAction[] {
    const playerId = this.getMyPlayerId();
    return GameEngine.getValidActions(this.state, playerId);
  }

  destroy(): void {
    this.listeners.clear();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
