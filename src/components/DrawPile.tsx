import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface DrawPileProps {
  cardsRemaining: number;
  onDraw: () => void;
  canDraw: boolean;
}

export function DrawPile({ cardsRemaining, onDraw, canDraw }: DrawPileProps) {
  return (
    <TouchableOpacity
      style={[styles.pile, canDraw && styles.pileActive]}
      onPress={onDraw}
      disabled={!canDraw}
      activeOpacity={0.7}
    >
      <Text style={styles.questionMark}>?</Text>
      <Text style={styles.count}>{cardsRemaining}</Text>
      {canDraw && <Text style={styles.drawHint}>Piocher</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pile: {
    width: 100,
    height: 140,
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  pileActive: {
    borderWidth: 2,
    borderColor: '#f1c40f',
  },
  questionMark: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  count: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 4,
  },
  drawHint: {
    fontSize: 11,
    color: '#f1c40f',
    marginTop: 4,
    fontWeight: '600',
  },
});
