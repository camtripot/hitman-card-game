import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GamePhase } from '../models/GameState';

interface TurnBannerProps {
  playerName: string;
  phase: GamePhase;
  isMyTurn: boolean;
  mustPlayCount: number;
}

const PHASE_CONFIG: Partial<Record<GamePhase, { label: string; emoji: string }>> = {
  [GamePhase.WAITING_FOR_TURN_ACTION]: { label: 'Joue ou pioche', emoji: '🃏' },
  [GamePhase.REACTION_WINDOW]: { label: 'Reaction !', emoji: '⚡' },
  [GamePhase.AWAITING_TARGET]: { label: 'Choisis une cible', emoji: '🎯' },
  [GamePhase.AWAITING_CARD_CHOICE]: { label: 'Choisis une carte', emoji: '🤝' },
  [GamePhase.VIEWING_VOYANTE]: { label: 'Voyante...', emoji: '🔮' },
  [GamePhase.GAME_OVER]: { label: 'Partie terminee !', emoji: '🏁' },
  [GamePhase.PLAYER_ELIMINATED]: { label: 'Joueur elimine !', emoji: '💀' },
};

export function TurnBanner({ playerName, phase, isMyTurn, mustPlayCount }: TurnBannerProps) {
  const config = PHASE_CONFIG[phase];
  const phaseLabel = config ? `${config.emoji} ${config.label}` : '';
  const turnEmoji = isMyTurn ? '⚔️' : '⏳';

  return (
    <View style={[styles.banner, isMyTurn ? styles.myTurnBanner : styles.waitingBanner]}>
      <View style={styles.row}>
        <Text style={styles.turnEmoji}>{turnEmoji}</Text>
        <Text style={styles.turnText}>
          {isMyTurn ? 'Ton tour !' : `Tour de ${playerName}`}
        </Text>
      </View>
      {phaseLabel ? <Text style={styles.phaseText}>{phaseLabel}</Text> : null}
      {mustPlayCount > 1 && (
        <Text style={styles.bombText}>💣 Bombe ! {mustPlayCount} actions restantes</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  myTurnBanner: {
    backgroundColor: '#0d2e18',
  },
  waitingBanner: {
    backgroundColor: '#100a08',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  turnEmoji: {
    fontSize: 18,
  },
  turnText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.3,
  },
  phaseText: {
    fontSize: 12,
    color: '#ccd6dd',
    marginTop: 2,
  },
  bombText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: 'bold',
    marginTop: 3,
  },
});
