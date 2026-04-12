import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../models/Player';

interface PlayerRingProps {
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
}

export function PlayerRing({ players, currentPlayerIndex, direction }: PlayerRingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.direction}>
        {direction === 1 ? '→ Sens horaire' : '← Sens anti-horaire'}
      </Text>
      <View style={styles.ring}>
        {players.map((player, index) => (
          <View
            key={player.id}
            style={[
              styles.playerBadge,
              index === currentPlayerIndex && styles.activeBadge,
              player.isEliminated && styles.eliminatedBadge,
            ]}
          >
            <Text
              style={[
                styles.playerName,
                player.isEliminated && styles.eliminatedText,
              ]}
              numberOfLines={1}
            >
              {player.name}
            </Text>
            <Text style={styles.cardCount}>
              {player.isEliminated ? 'Elimine' : `${player.hand.length} cartes`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  direction: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 8,
  },
  ring: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  playerBadge: {
    backgroundColor: '#34495e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 80,
  },
  activeBadge: {
    backgroundColor: '#2980b9',
    borderWidth: 2,
    borderColor: '#f1c40f',
  },
  eliminatedBadge: {
    backgroundColor: '#7f8c8d',
    opacity: 0.6,
  },
  playerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  eliminatedText: {
    textDecorationLine: 'line-through',
    color: '#bdc3c7',
  },
  cardCount: {
    fontSize: 10,
    color: '#bdc3c7',
    marginTop: 2,
  },
});
