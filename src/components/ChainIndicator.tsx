import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChainEntry } from '../models/GameState';
import { CARD_NAMES } from '../models/Card';

interface ChainIndicatorProps {
  chainedCards: ChainEntry[];
}

export function ChainIndicator({ chainedCards }: ChainIndicatorProps) {
  if (chainedCards.length === 0) return null;

  return (
    <View style={styles.container}>
      {chainedCards.map((entry, index) => (
        <View key={index} style={styles.badge}>
          <Text style={styles.icon}>⛓️</Text>
          <View style={styles.textContainer}>
            <Text style={styles.cardName}>{CARD_NAMES[entry.cardType]}</Text>
            <Text style={styles.turns}>{entry.turnsRemaining} tour{entry.turnsRemaining > 1 ? 's' : ''}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badge: {
    backgroundColor: '#4a1a6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#7b2faf',
  },
  icon: {
    fontSize: 14,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardName: {
    color: '#e0c3fc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  turns: {
    color: '#a78bdb',
    fontSize: 11,
  },
});
