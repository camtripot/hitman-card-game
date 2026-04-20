import { GameState, GamePhase } from '../models/GameState';
import { PlayerAction } from '../models/Actions';
import { GameEngine } from '../engine/GameEngine';
import { GameManager } from './GameManagerInterface';

export class LocalGameManager implements GameManager {
  private state: GameState = {} as GameState;
  private listeners: Set<(state: GameState) => void> = new Set();

  initialize(playerNames: string[], settings?: { startWithAnge: boolean; deadCardsReturnToPile: boolean }): void {
    this.state = GameEngine.createGame({
      playerNames,
      ...(settings || {}),
    });
    this.notifyListeners();
  }

  dispatch(action: PlayerAction): void {
    this.state = GameEngine.dispatch(this.state, action);

    // In local mode, auto-resolve reaction windows
    // since players can't secretly react on a shared device
    this.autoResolveReactions();

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

  private autoResolveReactions(): void {
    // Keep auto-passing until we exit the reaction window
    let safety = 0;
    while (this.state.phase === GamePhase.REACTION_WINDOW && this.state.reactionWindow && safety < 50) {
      safety++;
      const eligible = this.state.reactionWindow.eligiblePlayerIds;
      const passed = this.state.reactionWindow.passedPlayerIds;

      // Find the next player who hasn't passed yet
      const nextToPass = eligible.find(id => !passed.includes(id));
      if (!nextToPass) break;

      this.state = GameEngine.dispatch(this.state, {
        type: 'PASS_REACTION',
        playerId: nextToPass,
      });
    }
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
