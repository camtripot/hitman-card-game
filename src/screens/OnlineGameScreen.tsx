import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { GamePhase } from '../models/GameState';
import { CardCategory, Card } from '../models/Card';
import { OnlineGameManager, OnlineGameState } from '../multiplayer/OnlineGameManager';
import { TurnBanner } from '../components/TurnBanner';
import { PlayerRing } from '../components/PlayerRing';
import { DrawPile } from '../components/DrawPile';
import { PlayerHand } from '../components/PlayerHand';
import { TargetPicker } from '../components/TargetPicker';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { CardPreview } from '../components/CardPreview';
import { ChainIndicator } from '../components/ChainIndicator';
import { EventLog } from '../components/EventLog';
import { ResultsScreen } from './ResultsScreen';
import { isInstant } from '../engine/CardEffects';

interface OnlineGameScreenProps {
  route: {
    params: {
      manager: OnlineGameManager;
    };
  };
  navigation: {
    navigate: (name: string, params?: any) => void;
  };
}

export function OnlineGameScreen({ route, navigation }: OnlineGameScreenProps) {
  const { manager } = route.params;
  const [gameState, setGameState] = useState<OnlineGameState | null>(manager.getGameState());

  useEffect(() => {
    const unsubscribe = manager.onStateChange((state) => {
      setGameState({ ...state });
    });
    return () => {
      unsubscribe();
      manager.disconnect();
    };
  }, [manager]);

  const myPlayerId = manager.getPlayerId();

  // --- All hooks before any return ---

  const handlePlayCard = useCallback((cardId: string) => {
    manager.dispatch({ type: 'PLAY_CARD', playerId: myPlayerId, cardInstanceId: cardId });
  }, [manager, myPlayerId]);

  const handleDraw = useCallback(() => {
    manager.dispatch({ type: 'DRAW_CARD', playerId: myPlayerId });
  }, [manager, myPlayerId]);

  const handleChooseTarget = useCallback((targetId: string) => {
    manager.dispatch({ type: 'CHOOSE_TARGET', playerId: myPlayerId, targetPlayerId: targetId });
  }, [manager, myPlayerId]);

  const handleReact = useCallback((cardId: string) => {
    manager.dispatch({ type: 'REACT_WITH_CARD', playerId: myPlayerId, cardInstanceId: cardId });
  }, [manager, myPlayerId]);

  const handlePassReaction = useCallback(() => {
    manager.dispatch({ type: 'PASS_REACTION', playerId: myPlayerId });
  }, [manager, myPlayerId]);

  const handleAcknowledgeVoyante = useCallback(() => {
    manager.dispatch({ type: 'ACKNOWLEDGE_VOYANTE', playerId: myPlayerId });
  }, [manager, myPlayerId]);

  const handleChooseCardToGive = useCallback((cardId: string) => {
    manager.dispatch({ type: 'CHOOSE_CARD_TO_GIVE', playerId: myPlayerId, cardInstanceId: cardId });
  }, [manager, myPlayerId]);

  // --- Conditional renders ---

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100, fontSize: 18 }}>
          En attente de la partie...
        </Text>
      </View>
    );
  }

  if (gameState.phase === GamePhase.GAME_OVER && gameState.winner) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
      <ResultsScreen
        winnerName={winner?.name || 'Inconnu'}
        onPlayAgain={() => {
          manager.leaveRoom();
          navigation.navigate('Home');
        }}
        onGoHome={() => {
          manager.leaveRoom();
          navigation.navigate('Home');
        }}
      />
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const myPlayer = gameState.players.find(p => p.id === myPlayerId);
  const myHand: Card[] = myPlayer?.hand || [];
  const isMyTurn = currentPlayer?.id === myPlayerId;

  // Determine valid actions based on phase
  const playableCardIds: string[] = [];
  const reactableCardIds: string[] = [];
  let canDraw = false;

  if (gameState.phase === GamePhase.WAITING_FOR_TURN_ACTION && isMyTurn) {
    canDraw = gameState.drawPileCount > 0;
    for (const card of myHand) {
      if (card.category === CardCategory.TURN_ENDING) {
        const isChained = gameState.chainedCards.some((c: any) => c.cardType === card.type);
        if (!isChained) playableCardIds.push(card.id);
      }
    }
  }

  if (gameState.phase === GamePhase.REACTION_WINDOW && gameState.reactionWindow) {
    const isEligible = gameState.reactionWindow.eligiblePlayerIds.includes(myPlayerId);
    const hasPassed = gameState.reactionWindow.passedPlayerIds.includes(myPlayerId);
    if (isEligible && !hasPassed) {
      for (const card of myHand) {
        if (isInstant(card.type)) {
          const isChained = gameState.chainedCards.some((c: any) => c.cardType === card.type);
          if (!isChained) reactableCardIds.push(card.id);
        }
      }
    }
  }

  const showTargetPicker = gameState.phase === GamePhase.AWAITING_TARGET && isMyTurn;
  const showCardChoice = gameState.phase === GamePhase.AWAITING_CARD_CHOICE &&
    myPlayerId === gameState.players.find(p => {
      // target of voleur needs to give card
      return true; // simplified — server validates
    })?.id;
  const showReaction = gameState.phase === GamePhase.REACTION_WINDOW &&
    gameState.reactionWindow &&
    gameState.reactionWindow.eligiblePlayerIds.includes(myPlayerId) &&
    !gameState.reactionWindow.passedPlayerIds.includes(myPlayerId);
  const showVoyante = gameState.phase === GamePhase.VIEWING_VOYANTE &&
    gameState.voyanteCards.length > 0 && isMyTurn;

  // Build player objects compatible with components
  const playersForRing = gameState.players.map(p => ({
    id: p.id,
    name: p.name,
    hand: p.hand || Array(p.cardCount).fill(null),
    isEliminated: p.isEliminated,
    isConnected: p.isConnected,
  }));

  const playersForTarget = gameState.players.map(p => ({
    id: p.id,
    name: p.name,
    hand: Array(p.cardCount).fill(null),
    isEliminated: p.isEliminated,
    isConnected: p.isConnected,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.roomCodeBar}>
        <Text style={styles.roomCodeText}>Salon: {manager.getRoomCode()}</Text>
      </View>

      <TurnBanner
        playerName={currentPlayer?.name || ''}
        phase={gameState.phase}
        isMyTurn={isMyTurn}
        mustPlayCount={gameState.mustPlayCount}
      />

      <PlayerRing
        players={playersForRing}
        currentPlayerIndex={gameState.currentPlayerIndex}
        direction={gameState.direction}
      />

      <ChainIndicator chainedCards={gameState.chainedCards} />

      <EventLog event={gameState.lastEvent} />

      <View style={styles.centerArea}>
        <DrawPile
          cardsRemaining={gameState.drawPileCount}
          onDraw={handleDraw}
          canDraw={canDraw}
        />
      </View>

      <View style={styles.handArea}>
        {gameState.phase === GamePhase.AWAITING_CARD_CHOICE ? (
          <PlayerHand
            cards={myHand}
            playableCardIds={myHand.map(c => c.id)}
            onPlayCard={handleChooseCardToGive}
          />
        ) : (
          <PlayerHand
            cards={myHand}
            playableCardIds={playableCardIds}
            onPlayCard={handlePlayCard}
          />
        )}
      </View>

      <TargetPicker
        visible={showTargetPicker}
        players={playersForTarget}
        myPlayerId={myPlayerId}
        onChoose={handleChooseTarget}
      />

      {showReaction && (
        <ReactionOverlay
          visible={true}
          cards={myHand}
          playableCardIds={reactableCardIds}
          onReact={handleReact}
          onPass={handlePassReaction}
          canReact={reactableCardIds.length > 0}
        />
      )}

      <CardPreview
        visible={showVoyante}
        cards={gameState.voyanteCards}
        onDismiss={handleAcknowledgeVoyante}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  roomCodeBar: {
    backgroundColor: '#2c3e50',
    paddingVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  roomCodeText: {
    color: '#f1c40f',
    fontSize: 12,
    fontWeight: '600',
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handArea: {
    borderTopWidth: 1,
    borderTopColor: '#2c3e50',
  },
});
