import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GamePhase } from '../models/GameState';
import { PlayerAction } from '../models/Actions';
import { GameEngine } from '../engine/GameEngine';
import { LocalGameManager } from '../multiplayer/LocalGameManager';

interface GameContextValue {
  gameState: GameState | null;
  myPlayerId: string;
  validActions: PlayerAction[];
  dispatch: (action: PlayerAction) => void;
  startLocalGame: (playerNames: string[], settings?: { startWithAnge: boolean; deadCardsReturnToPile: boolean }) => void;
  isMyTurn: boolean;
  mode: 'local' | 'online';
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const managerRef = useRef<LocalGameManager | null>(null);

  const startLocalGame = useCallback((playerNames: string[], settings?: { startWithAnge: boolean; deadCardsReturnToPile: boolean }) => {
    const manager = new LocalGameManager();
    manager.initialize(playerNames, settings);
    managerRef.current = manager;
    setGameState(manager.getState());

    manager.subscribe((state) => {
      setGameState({ ...state });
    });
  }, []);

  const dispatch = useCallback((action: PlayerAction) => {
    if (managerRef.current) {
      managerRef.current.dispatch(action);
    }
  }, []);

  const myPlayerId = gameState
    ? (managerRef.current?.getMyPlayerId() ?? '')
    : '';

  const validActions = gameState
    ? GameEngine.getValidActions(gameState, myPlayerId)
    : [];

  const isMyTurn = gameState
    ? gameState.players[gameState.currentPlayerIndex]?.id === myPlayerId
    : false;

  useEffect(() => {
    return () => {
      managerRef.current?.destroy();
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        myPlayerId,
        validActions,
        dispatch,
        startLocalGame,
        isMyTurn,
        mode: 'local',
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
