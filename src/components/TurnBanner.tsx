import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GamePhase } from '../models/GameState';

interface TurnBannerProps {
  playerName: string;
  phase: GamePhase;
  isMyTurn: boolean;
  mustPlayCount: number;
}

const PHASE_LABELS: Partial<Record<GamePhase, string>> = {
  [GamePhase.WAITING_FOR_TURN_ACTION]: 'Joue ou pioche',
  [GamePhase.REACTION_WINDOW]: 'Fenetre de reaction !',
  [GamePhase.AWAITING_TARGET]: 'Choisis une cible',
  [GamePhase.AWAITING_CARD_CHOICE]: 'Choisis une carte a donner',
  [GamePhase.VIEWING_VOYANTE]: 'Regarde la pioche...',
  [GamePhase.GAME_OVER]: 'Partie terminee !',
  [GamePhase.PLAYER_ELIMINATED]: 'Joueur elimine !',
};

export function TurnBanner({ playerName, phase, isMyTurn, mustPlayCount }: TurnBannerProps) {
  const phaseLabel = PHASE_LABELS[phase] || '';

  return (
    <View style={[styles.banner, isMyTurn && styles.myTurnBanner]}>
      <Text style={styles.turnText}>
        {isMyTurn ? 'Ton tour !' : `Tour de ${playerName}`}
      </Text>
      <Text style={styles.phaseText}>{phaseLabel}</Text>
      {mustPlayCount > 1 && (
        <Text style={styles.bombText}>Bombe ! {mustPlayCount} actions restantes</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  myTurnBanner: {
    backgroundColor: '#27ae60',
  },
  turnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  phaseText: {
    fontSize: 13,
    color: '#ecf0f1',
    marginTop: 2,
  },
  bombText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
