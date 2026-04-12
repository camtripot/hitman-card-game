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
          <Text style={styles.text}>
            {CARD_NAMES[entry.cardType]} enchainee ({entry.turnsRemaining} tours)
          </Text>
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
    gap: 6,
    paddingVertical: 4,
  },
  badge: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
