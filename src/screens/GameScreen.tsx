import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, Animated, Pressable, Dimensions, ScrollView,
} from 'react-native';
import { GamePhase } from '../models/GameState';
import { Card, CardType } from '../models/Card';
import { useGame } from '../context/GameContext';
import { PokerTable } from '../components/PokerTable';
import { PlayerHand } from '../components/PlayerHand';
import { TargetPicker } from '../components/TargetPicker';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { CardPreview } from '../components/CardPreview';
import { ChainIndicator } from '../components/ChainIndicator';
import { EventLog } from '../components/EventLog';
import { DrawnCardOverlay } from '../components/DrawnCardOverlay';
import { CardPreviewModal } from '../components/CardPreviewModal';
import { HitmanPlacerOverlay } from '../components/HitmanPlacerOverlay';
import { HandRevealScreen } from './HandRevealScreen';
import { ResultsScreen } from './ResultsScreen';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

interface GameScreenProps {
  route: any;
  navigation: any;
}

export function GameScreen({ route, navigation }: GameScreenProps) {
  const { playerNames, mode, settings } = route.params;
  const { gameState, myPlayerId, validActions, dispatch, startLocalGame } = useGame();

  // ── Hand reveal ──
  const [showHandReveal, setShowHandReveal] = useState(false);
  const [lastPlayerIndex, setLastPlayerIndex] = useState(-1);
  const [pendingHandReveal, setPendingHandReveal] = useState(false);

  // ── Animation pioche ──
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [drawnCardEvent, setDrawnCardEvent] = useState<'draw' | 'hitman_kill' | 'ange_save' | 'ange_choice'>('draw');
  const [drawnByPlayer, setDrawnByPlayer] = useState('');

  // ── Écran élimination ──
  const [showEliminatedScreen, setShowEliminatedScreen] = useState(false);
  const [eliminatedPlayerName, setEliminatedPlayerName] = useState('');

  // ── Mode spectateur ──
  const [isSpectating, setIsSpectating] = useState(false);
  const [spectatingPlayerId, setSpectatingPlayerId] = useState<string | null>(null);

  // ── Prévisualisation carte ──
  const [previewCard, setPreviewCard] = useState<Card | null>(null);

  // ── Animation jeu de carte ──
  const flyAnim = useRef(new Animated.Value(0)).current;
  const [flyingCard, setFlyingCard] = useState<Card | null>(null);
  const [pendingPlayCardId, setPendingPlayCardId] = useState<string | null>(null);

  // ── ALL HOOKS FIRST ──

  useEffect(() => {
    try { startLocalGame(playerNames, settings); } catch (e) { console.error(e); }
  }, []);

  // Détection changement de joueur → hand reveal
  useEffect(() => {
    if (!gameState || mode !== 'local') return;
    if (gameState.phase === GamePhase.GAME_OVER) return;
    if (isSpectating) return;

    if (lastPlayerIndex !== -1 && lastPlayerIndex !== gameState.currentPlayerIndex) {
      if (gameState.phase === GamePhase.WAITING_FOR_TURN_ACTION) {
        if (drawnCard) {
          setPendingHandReveal(true);
        } else {
          setShowHandReveal(true);
        }
      }
    }
    setLastPlayerIndex(gameState.currentPlayerIndex);
  }, [gameState?.currentPlayerIndex, gameState?.phase]);

  // Déclencher hand reveal une fois l'overlay de pioche fermé
  useEffect(() => {
    if (pendingHandReveal && !drawnCard) {
      setShowHandReveal(true);
      setPendingHandReveal(false);
    }
  }, [pendingHandReveal, drawnCard]);

  // Animation jeu de carte : dispatch après l'animation
  useEffect(() => {
    if (pendingPlayCardId && !flyingCard) {
      dispatch({ type: 'PLAY_CARD', playerId: myPlayerId, cardInstanceId: pendingPlayCardId });
      setPendingPlayCardId(null);
    }
  }, [flyingCard, pendingPlayCardId]);

  // Clic sur une carte → ouvrir la prévisualisation
  const handlePlayCard = useCallback((cardId: string) => {
    const card = gameState?.players.find(p => p.id === myPlayerId)?.hand.find(c => c.id === cardId);
    if (!card) return;
    setPreviewCard(card);
  }, [gameState, myPlayerId]);

  // Confirmation depuis la prévisualisation → lancer l'animation puis dispatcher
  const handleConfirmPlay = useCallback(() => {
    if (!previewCard) return;
    const cardId = previewCard.id;
    setPreviewCard(null);

    setFlyingCard(previewCard);
    flyAnim.setValue(0);
    setPendingPlayCardId(cardId);

    Animated.timing(flyAnim, {
      toValue: 1,
      duration: 380,
      useNativeDriver: false,
    }).start(() => {
      setFlyingCard(null);
    });
  }, [previewCard, flyAnim]);

  const handleDraw = useCallback(() => {
    if (!gameState || gameState.drawPile.length === 0) return;
    const topCard = gameState.drawPile[0];
    const currentP = gameState.players[gameState.currentPlayerIndex];
    const hasAnge = currentP.hand.some(c => c.type === CardType.ANGE);

    setDrawnCard(topCard);
    setDrawnByPlayer(currentP.name);

    if (topCard.type === CardType.HITMAN && hasAnge) {
      // Choix manuel : on n'envoie PAS encore l'action au moteur
      setDrawnCardEvent('ange_choice');
    } else if (topCard.type === CardType.HITMAN) {
      setDrawnCardEvent('hitman_kill');
      dispatch({ type: 'DRAW_CARD', playerId: myPlayerId });
    } else {
      setDrawnCardEvent('draw');
      dispatch({ type: 'DRAW_CARD', playerId: myPlayerId });
    }
  }, [dispatch, myPlayerId, gameState]);

  const handleDismissDrawnCard = useCallback((choice?: 'use_ange' | 'skip_ange') => {
    if (drawnCardEvent === 'ange_choice') {
      if (choice === 'use_ange') {
        dispatch({ type: 'DRAW_CARD', playerId: myPlayerId });
      } else {
        dispatch({ type: 'DRAW_CARD_SKIP_ANGE', playerId: myPlayerId });
        // L'élimination se réglera via le moteur ; on affiche l'écran éliminé
        setEliminatedPlayerName(drawnByPlayer);
        setShowEliminatedScreen(true);
      }
    } else if (drawnCardEvent === 'hitman_kill') {
      setEliminatedPlayerName(drawnByPlayer);
      setShowEliminatedScreen(true);
    }
    setDrawnCard(null);
  }, [drawnCardEvent, drawnByPlayer, dispatch, myPlayerId]);

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

  const playableCardIds = useMemo(() =>
    validActions.filter(a => a.type === 'PLAY_CARD').map(a => (a as any).cardInstanceId),
    [validActions]
  );
  const reactableCardIds = useMemo(() =>
    validActions.filter(a => a.type === 'REACT_WITH_CARD').map(a => (a as any).cardInstanceId),
    [validActions]
  );
  const canDraw = validActions.some(a => a.type === 'DRAW_CARD');

  // ── RENDERS CONDITIONNELS ──

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (gameState.phase === GamePhase.GAME_OVER && gameState.winner) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
      <ResultsScreen
        winnerName={winner?.name || 'Inconnu'}
        onPlayAgain={() => startLocalGame(playerNames, settings)}
        onGoHome={() => navigation.navigate('Home')}
      />
    );
  }

  // Overlay pioche
  if (drawnCard) {
    return (
      <View style={styles.container}>
        <DrawnCardOverlay
          card={drawnCard}
          eventType={drawnCardEvent}
          playerName={drawnByPlayer}
          onDismiss={handleDismissDrawnCard}
        />
      </View>
    );
  }

  // Écran élimination
  if (showEliminatedScreen) {
    const alivePlayers = gameState.players.filter(p => !p.isEliminated);
    return (
      <View style={styles.eliminatedScreen}>
        <Text style={styles.elimEmoji}>💀</Text>
        <Text style={styles.elimTitle}>{eliminatedPlayerName}</Text>
        <Text style={styles.elimSubtitle}>a été éliminé !</Text>
        <Text style={styles.elimInfo}>{alivePlayers.length} joueur{alivePlayers.length > 1 ? 's' : ''} restant{alivePlayers.length > 1 ? 's' : ''}</Text>

        <View style={styles.elimButtons}>
          <Pressable
            style={[styles.elimBtn, styles.elimBtnWatch]}
            onPress={() => {
              setSpectatingPlayerId(alivePlayers[0]?.id ?? null);
              setIsSpectating(true);
              setShowEliminatedScreen(false);
            }}
          >
            <Text style={styles.elimBtnText}>👁  Regarder la partie</Text>
          </Pressable>
          <Pressable
            style={[styles.elimBtn, styles.elimBtnPass]}
            onPress={() => {
              setShowEliminatedScreen(false);
              // Le hand reveal s'affichera via pendingHandReveal ou manuellement
              setShowHandReveal(true);
            }}
          >
            <Text style={styles.elimBtnText}>📱  Passer le téléphone</Text>
          </Pressable>
        </View>
      </View>
    );
  }

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

  // Choix de la position du Hitman (après sauvegarde par Ange)
  if (gameState.phase === GamePhase.CHOOSING_HITMAN_POSITION && isMyTurn) {
    return (
      <HitmanPlacerOverlay
        pileSize={gameState.drawPile.length}
        onPlace={(position) => dispatch({ type: 'PLACE_HITMAN', playerId: myPlayerId, position })}
      />
    );
  }

  const showTargetPicker = gameState.phase === GamePhase.AWAITING_TARGET &&
    validActions.some(a => a.type === 'CHOOSE_TARGET');
  const showCardChoice = gameState.phase === GamePhase.AWAITING_CARD_CHOICE &&
    validActions.some(a => a.type === 'CHOOSE_CARD_TO_GIVE');
  const showReaction = gameState.phase === GamePhase.REACTION_WINDOW &&
    (validActions.some(a => a.type === 'REACT_WITH_CARD') || validActions.some(a => a.type === 'PASS_REACTION'));
  const showVoyante = gameState.phase === GamePhase.VIEWING_VOYANTE && gameState.voyanteCards.length > 0;

  // ── MODE SPECTATEUR ──
  if (isSpectating && spectatingPlayerId) {
    const spectated = gameState.players.find(p => p.id === spectatingPlayerId);
    const alivePlayers = gameState.players.filter(p => !p.isEliminated);

    if (gameState.phase === GamePhase.GAME_OVER) {
      setIsSpectating(false);
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Bandeau spectateur */}
        <View style={styles.spectatorBanner}>
          <Text style={styles.spectatorLabel}>👁  SPECTATEUR</Text>
          <Text style={styles.spectatorWatching}>Vous regardez : <Text style={styles.spectatorName}>{spectated?.name}</Text></Text>
        </View>

        {/* Table de poker */}
        <PokerTable
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          direction={gameState.direction}
          drawPileCount={gameState.drawPile.length}
          discardPileCount={gameState.discardPile.length}
          lastPlayedCardType={gameState.lastPlayedCardType}
          mustPlayCount={gameState.mustPlayCount}
          onDraw={() => {}}
          canDraw={false}
        />

        {/* Log */}
        <EventLog event={gameState.lastEvent} />
        <ChainIndicator chainedCards={gameState.chainedCards} />

        {/* Main du joueur observé (De Faux caché) */}
        <View style={styles.spectatorHandArea}>
          <Text style={styles.spectatorHandLabel}>Main de {spectated?.name}</Text>
          {spectated && (
            <PlayerHand
              cards={spectated.hand}
              playableCardIds={[]}
              onPlayCard={() => {}}
              isOwnedByViewer={false}
            />
          )}
        </View>

        {/* Sélecteur de joueur à observer */}
        <ScrollView horizontal style={styles.spectatorSwitch} contentContainerStyle={styles.spectatorSwitchContent}>
          {alivePlayers.map(p => (
            <Pressable
              key={p.id}
              style={[styles.spectatorSwitchBtn, spectatingPlayerId === p.id && styles.spectatorSwitchActive]}
              onPress={() => setSpectatingPlayerId(p.id)}
            >
              <Text style={styles.spectatorSwitchText}>{p.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── VUE NORMALE ──
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Bandeau de tour */}
      <View style={[styles.turnBanner, isMyTurn ? styles.turnBannerMy : styles.turnBannerOther]}>
        <Text style={styles.turnText}>
          {isMyTurn ? '⚔️ Ton tour !' : `⏳ Tour de ${currentPlayer?.name}`}
        </Text>
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
      </View>

      {/* Table de poker */}
      <PokerTable
        players={gameState.players}
        currentPlayerIndex={gameState.currentPlayerIndex}
        direction={gameState.direction}
        drawPileCount={gameState.drawPile.length}
        discardPileCount={gameState.discardPile.length}
        lastPlayedCardType={gameState.lastPlayedCardType}
        mustPlayCount={gameState.mustPlayCount}
        onDraw={handleDraw}
        canDraw={canDraw}
      />

      <ChainIndicator chainedCards={gameState.chainedCards} />
      <EventLog event={gameState.lastEvent} />

      {/* Main du joueur */}
      {myPlayer && (
        <View style={styles.handArea}>
          {showCardChoice ? (
            <PlayerHand
              cards={myPlayer.hand}
              playableCardIds={myPlayer.hand.map(c => c.id)}
              onPlayCard={handleChooseCardToGive}
              isOwnedByViewer={true}
            />
          ) : (
            <PlayerHand
              cards={myPlayer.hand}
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
        canPlay={previewCard ? playableCardIds.includes(previewCard.id) : false}
        isOwnedByViewer={true}
        onPlay={handleConfirmPlay}
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
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
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
  turnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.3 },
  bombText: { color: '#f39c12', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  phaseText: { color: '#7f8fa6', fontSize: 11, marginTop: 2 },

  // Main
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

  // Écran élimination
  eliminatedScreen: {
    flex: 1,
    backgroundColor: '#06000a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  elimEmoji: { fontSize: 64, marginBottom: 12 },
  elimTitle: { color: '#cc0000', fontSize: 32, fontWeight: '900', letterSpacing: 4 },
  elimSubtitle: { color: '#666', fontSize: 16, marginTop: 4, marginBottom: 20 },
  elimInfo: { color: '#333', fontSize: 14, marginBottom: 36 },
  elimButtons: { width: '100%', gap: 12 },
  elimBtn: {
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    cursor: 'pointer' as any,
    borderWidth: 1,
  },
  elimBtnWatch: { backgroundColor: '#0a0a1a', borderColor: '#2a2a5a' },
  elimBtnPass: { backgroundColor: '#1a0000', borderColor: '#5a0000' },
  elimBtnText: { color: '#aaa', fontSize: 15, fontWeight: '600' },

  // Mode spectateur
  spectatorBanner: {
    backgroundColor: '#0a0514',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a0a2e',
    alignItems: 'center',
  },
  spectatorLabel: { color: '#6644aa', fontSize: 10, fontWeight: '700', letterSpacing: 3 },
  spectatorWatching: { color: '#555', fontSize: 13, marginTop: 2 },
  spectatorName: { color: '#8855cc', fontWeight: 'bold' },
  spectatorHandArea: {
    borderTopWidth: 1,
    borderTopColor: '#0f0f1a',
    flex: 1,
    minHeight: 0,
    opacity: 0.75,
  },
  spectatorHandLabel: {
    color: '#3a2a5a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginLeft: 14,
    marginTop: 8,
  },
  spectatorSwitch: {
    maxHeight: 52,
    borderTopWidth: 1,
    borderTopColor: '#0f0f1a',
  },
  spectatorSwitchContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  spectatorSwitchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0f0f1a',
    borderWidth: 1,
    borderColor: '#1a1a2e',
    cursor: 'pointer' as any,
  },
  spectatorSwitchActive: {
    backgroundColor: '#1a0a2e',
    borderColor: '#6644aa',
  },
  spectatorSwitchText: { color: '#666', fontSize: 12, fontWeight: '600' },
});
