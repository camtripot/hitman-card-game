import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, Animated, Dimensions,
} from 'react-native';
import { GamePhase } from '../models/GameState';
import { CardCategory, Card, CardType } from '../models/Card';
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
import { CardPreviewModal } from '../components/CardPreviewModal';
import { ResultsScreen } from './ResultsScreen';
import { isInstant } from '../engine/CardEffects';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

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
  const [previewCard, setPreviewCard] = useState<Card | null>(null);

  // Animation carte jouée
  const flyAnim = useRef(new Animated.Value(0)).current;
  const [flyingCard, setFlyingCard] = useState<Card | null>(null);

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

  // --- Handlers ---

  const handlePlayCard = useCallback((cardId: string) => {
    const myPlayer = gameState?.players.find(p => p.id === myPlayerId);
    const card = myPlayer?.hand?.find((c: Card) => c.id === cardId);
    if (!card) return;
    setPreviewCard(card);
  }, [gameState, myPlayerId]);

  const handleConfirmPlay = useCallback(() => {
    if (!previewCard) return;
    const cardId = previewCard.id;
    const card = previewCard;
    setPreviewCard(null);

    // Animation
    setFlyingCard(card);
    flyAnim.setValue(0);
    Animated.timing(flyAnim, {
      toValue: 1,
      duration: 380,
      useNativeDriver: false,
    }).start(() => {
      setFlyingCard(null);
    });

    manager.dispatch({ type: 'PLAY_CARD', playerId: myPlayerId, cardInstanceId: cardId });
  }, [previewCard, flyAnim, manager, myPlayerId]);

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

  // --- Early returns ---

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

  // --- Calcul des cartes jouables (identique au moteur local) ---
  const playableCardIds: string[] = [];
  const reactableCardIds: string[] = [];
  let canDraw = false;

  if (gameState.phase === GamePhase.WAITING_FOR_TURN_ACTION && isMyTurn) {
    canDraw = gameState.drawPileCount > 0;
    for (const card of myHand) {
      const isChained = gameState.chainedCards.some((c: any) => c.cardType === card.type);
      if (isChained) continue;
      // Cartes fin de tour ET PEEK (Voyante, Voleur, Dé Vrai, Dé Faux)
      if (card.category === CardCategory.TURN_ENDING || card.category === CardCategory.PEEK) {
        playableCardIds.push(card.id);
      }
      // Miroir, Chaîne, Météorite jouables sur son tour si une carte a été posée
      if (
        card.category === CardCategory.INSTANT &&
        gameState.lastPlayedCardType !== null &&
        (card.type === CardType.MIROIR || card.type === CardType.CHAINE || card.type === CardType.METEORITE)
      ) {
        playableCardIds.push(card.id);
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
  // Le serveur indique si ce joueur doit donner une carte (cible du Voleur)
  const showCardChoice = gameState.isAwaitingCardChoice;
  const showReaction = gameState.phase === GamePhase.REACTION_WINDOW &&
    gameState.reactionWindow !== null &&
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

      {/* Bandeau de tour */}
      <View style={[styles.turnBanner, isMyTurn ? styles.turnBannerMy : styles.turnBannerOther]}>
        <View style={styles.turnBannerRow}>
          <Text style={styles.turnText}>
            {isMyTurn ? '⚔️ Ton tour !' : `⏳ Tour de ${currentPlayer?.name}`}
          </Text>
          <Text style={styles.roomCodeText}>#{manager.getRoomCode()}</Text>
        </View>
        {gameState.mustPlayCount > 1 && (
          <Text style={styles.bombText}>💣 Bombe — {gameState.mustPlayCount} actions restantes</Text>
        )}
        {gameState.phase === GamePhase.REACTION_WINDOW && (
          <Text style={styles.phaseText}>⚡ Réaction ouverte !</Text>
        )}
        {gameState.phase === GamePhase.VIEWING_VOYANTE && (
          <Text style={styles.phaseText}>🔮 Voyante…</Text>
        )}
        {gameState.phase === GamePhase.AWAITING_TARGET && (
          <Text style={styles.phaseText}>🎯 Choisis une cible</Text>
        )}
        {showCardChoice && (
          <Text style={styles.phaseText}>🃏 Donne une carte au Voleur</Text>
        )}
      </View>

      <PlayerRing
        players={playersForRing}
        currentPlayerIndex={gameState.currentPlayerIndex}
        direction={gameState.direction}
      />

      <View style={styles.gameBody}>
        <ChainIndicator chainedCards={gameState.chainedCards} />
        <EventLog event={gameState.lastEvent} />

        <View style={styles.centerArea}>
          <DrawPile
            cardsRemaining={gameState.drawPileCount}
            onDraw={handleDraw}
            canDraw={canDraw}
          />
        </View>
      </View>

      {/* Main du joueur */}
      {myPlayer && (
        <View style={styles.handArea}>
          {showCardChoice ? (
            <PlayerHand
              cards={myHand}
              playableCardIds={myHand.map((c: Card) => c.id)}
              onPlayCard={handleChooseCardToGive}
              isOwnedByViewer={true}
            />
          ) : (
            <PlayerHand
              cards={myHand}
              playableCardIds={playableCardIds}
              onPlayCard={handlePlayCard}
              isOwnedByViewer={true}
            />
          )}
        </View>
      )}

      {/* Overlays */}
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

      {/* Animation carte jouée */}
      {flyingCard && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.flyingCard,
            {
              top: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_H * 0.62, SCREEN_H * 0.28] }),
              left: SCREEN_W / 2 - 47,
              opacity: flyAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.9, 0] }),
              transform: [
                { scale: flyAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 1.1, 0.7] }) },
                { rotate: flyAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-8deg'] }) },
              ],
            },
          ]}
        >
          {React.createElement(
            require('../components/CardComponent').CardComponent,
            { card: flyingCard, disabled: true }
          )}
        </Animated.View>
      )}

      {/* Prévisualisation carte au clic */}
      <CardPreviewModal
        card={previewCard}
        canPlay={previewCard ? (showCardChoice ? true : playableCardIds.includes(previewCard.id)) : false}
        isOwnedByViewer={true}
        onPlay={showCardChoice
          ? () => { if (previewCard) { setPreviewCard(null); handleChooseCardToGive(previewCard.id); } }
          : handleConfirmPlay
        }
        onCancel={() => setPreviewCard(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080810',
    height: '100%' as any,
    maxHeight: '100vh' as any,
    overflow: 'hidden' as any,
  },

  // Bandeau de tour
  turnBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  turnBannerMy: { backgroundColor: '#0d2e18' },
  turnBannerOther: { backgroundColor: '#100a08' },
  turnBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  turnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.3 },
  roomCodeText: { color: '#2a2a4a', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  bombText: { color: '#f39c12', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  phaseText: { color: '#7f8fa6', fontSize: 11, marginTop: 2 },

  gameBody: {
    flex: 1,
    minHeight: 0,
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 0,
  },

  handArea: {
    borderTopWidth: 1,
    borderTopColor: '#0f0f1a',
    flex: 1,
    minHeight: 0,
  },

  // Animation carte volante
  flyingCard: {
    position: 'absolute',
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
});
