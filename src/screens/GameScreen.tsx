import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { GamePhase } from '../models/GameState';
import { CardCategory } from '../models/Card';
import { useGame } from '../context/GameContext';
import { TurnBanner } from '../components/TurnBanner';
import { PlayerRing } from '../components/PlayerRing';
import { DrawPile } from '../components/DrawPile';
import { PlayerHand } from '../components/PlayerHand';
import { TargetPicker } from '../components/TargetPicker';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { CardPreview } from '../components/CardPreview';
import { ChainIndicator } from '../components/ChainIndicator';
import { EventLog } from '../components/EventLog';
import { HandRevealScreen } from './HandRevealScreen';
import { ResultsScreen } from './ResultsScreen';

interface GameScreenProps {
  route: any;
  navigation: any;
}

export function GameScreen({ route, navigation }: GameScreenProps) {
  const { playerNames, mode } = route.params;
  const { gameState, myPlayerId, validActions, dispatch, startLocalGame } = useGame();
  const [showHandReveal, setShowHandReveal] = useState(false);
  const [lastPlayerIndex, setLastPlayerIndex] = useState(-1);

  useEffect(() => {
    startLocalGame(playerNames);
  }, []);

  // In local mode, show hand reveal screen when turn changes
  useEffect(() => {
    if (!gameState || mode !== 'local') return;
    if (gameState.phase === GamePhase.GAME_OVER) return;

    if (lastPlayerIndex !== -1 && lastPlayerIndex !== gameState.currentPlayerIndex) {
      if (gameState.phase === GamePhase.WAITING_FOR_TURN_ACTION) {
        setShowHandReveal(true);
      }
    }
    setLastPlayerIndex(gameState.currentPlayerIndex);
  }, [gameState?.currentPlayerIndex, gameState?.phase]);

  if (!gameState) return null;

  // Game over screen
  if (gameState.phase === GamePhase.GAME_OVER && gameState.winner) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
      <ResultsScreen
        winnerName={winner?.name || 'Inconnu'}
        onPlayAgain={() => startLocalGame(playerNames)}
        onGoHome={() => navigation.navigate('Home')}
      />
    );
  }

  // Hand reveal (pass the phone)
  if (showHandReveal) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return (
      <HandRevealScreen
        playerName={currentPlayer.name}
        onReady={() => setShowHandReveal(false)}
      />
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const myPlayer = gameState.players.find(p => p.id === myPlayerId);
  const isMyTurn = currentPlayer?.id === myPlayerId;

  // Determine which cards are playable
  const playableCardIds = validActions
    .filter(a => a.type === 'PLAY_CARD')
    .map(a => (a as any).cardInstanceId);

  const reactableCardIds = validActions
    .filter(a => a.type === 'REACT_WITH_CARD')
    .map(a => (a as any).cardInstanceId);

  const canDraw = validActions.some(a => a.type === 'DRAW_CARD');
  const showTargetPicker = gameState.phase === GamePhase.AWAITING_TARGET &&
    validActions.some(a => a.type === 'CHOOSE_TARGET');
  const showCardChoice = gameState.phase === GamePhase.AWAITING_CARD_CHOICE &&
    validActions.some(a => a.type === 'CHOOSE_CARD_TO_GIVE');
  const showReaction = gameState.phase === GamePhase.REACTION_WINDOW &&
    (validActions.some(a => a.type === 'REACT_WITH_CARD') ||
     validActions.some(a => a.type === 'PASS_REACTION'));
  const showVoyante = gameState.phase === GamePhase.VIEWING_VOYANTE &&
    gameState.voyanteCards.length > 0;

  const handlePlayCard = useCallback((cardId: string) => {
    dispatch({ type: 'PLAY_CARD', playerId: myPlayerId, cardInstanceId: cardId });
  }, [dispatch, myPlayerId]);

  const handleDraw = useCallback(() => {
    dispatch({ type: 'DRAW_CARD', playerId: myPlayerId });
  }, [dispatch, myPlayerId]);

  const handleChooseTarget = useCallback((targetId: string) => {
    dispatch({ type: 'CHOOSE_TARGET', playerId: myPlayerId, targetPlayerId: targetId });
  }, [dispatch, myPlayerId]);

  const handleReact = useCallback((cardId: string) => {
    dispatch({ type: 'REACT_WITH_CARD', playerId: myPlayerId, cardInstanceId: cardId });
  }, [dispatch, myPlayerId]);

  const handlePassReaction = useCallback(() => {
    dispatch({ type: 'PASS_REACTION', playerId: myPlayerId });
  }, [dispatch, myPlayerId]);

  const handleAcknowledgeVoyante = useCallback(() => {
    dispatch({ type: 'ACKNOWLEDGE_VOYANTE', playerId: myPlayerId });
  }, [dispatch, myPlayerId]);

  const handleChooseCardToGive = useCallback((cardId: string) => {
    dispatch({ type: 'CHOOSE_CARD_TO_GIVE', playerId: myPlayerId, cardInstanceId: cardId });
  }, [dispatch, myPlayerId]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <TurnBanner
        playerName={currentPlayer?.name || ''}
        phase={gameState.phase}
        isMyTurn={isMyTurn}
        mustPlayCount={gameState.mustPlayCount}
      />

      <PlayerRing
        players={gameState.players}
        currentPlayerIndex={gameState.currentPlayerIndex}
        direction={gameState.direction}
      />

      <ChainIndicator chainedCards={gameState.chainedCards} />

      <EventLog event={gameState.lastEvent} />

      <View style={styles.centerArea}>
        <DrawPile
          cardsRemaining={gameState.drawPile.length}
          onDraw={handleDraw}
          canDraw={canDraw}
        />
      </View>

      {myPlayer && (
        <View style={styles.handArea}>
          {showCardChoice ? (
            <PlayerHand
              cards={myPlayer.hand}
              playableCardIds={myPlayer.hand.map(c => c.id)}
              onPlayCard={handleChooseCardToGive}
            />
          ) : (
            <PlayerHand
              cards={myPlayer.hand}
              playableCardIds={playableCardIds}
              onPlayCard={handlePlayCard}
            />
          )}
        </View>
      )}

      <TargetPicker
        visible={showTargetPicker}
        players={gameState.players}
        myPlayerId={myPlayerId}
        onChoose={handleChooseTarget}
      />

      {showReaction && myPlayer && (
        <ReactionOverlay
          visible={showReaction}
          cards={myPlayer.hand}
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
