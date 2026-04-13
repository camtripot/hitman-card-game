import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';

interface DrawPileProps {
  cardsRemaining: number;
  onDraw: () => void;
  canDraw: boolean;
}

export function DrawPile({ cardsRemaining, onDraw, canDraw }: DrawPileProps) {
  return (
    <View style={styles.container}>
      {/* Stack effect: 3 offset rectangles behind the main card */}
      <View style={[styles.stackCard, styles.stackCard3]} />
      <View style={[styles.stackCard, styles.stackCard2]} />
      <View style={[styles.stackCard, styles.stackCard1]} />

      {/* Main card */}
      <Pressable
        style={[styles.pile, canDraw && styles.pileActive]}
        onPress={onDraw}
        disabled={!canDraw}
      >
        <Text style={styles.cardEmoji}>{'\u{1F3B4}'}</Text>
        <Text style={styles.count}>{cardsRemaining}</Text>
        {canDraw && <Text style={styles.drawHint}>Piocher</Text>}
      </Pressable>
    </View>
  );
}

const PILE_WIDTH = 100;
const PILE_HEIGHT = 140;
const PILE_RADIUS = 12;
const PILE_BG = '#1a1a2e';
const STACK_BG = '#16213e';

const styles = StyleSheet.create({
  container: {
    width: PILE_WIDTH + 12,
    height: PILE_HEIGHT + 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackCard: {
    position: 'absolute',
    width: PILE_WIDTH,
    height: PILE_HEIGHT,
    backgroundColor: STACK_BG,
    borderRadius: PILE_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stackCard3: {
    top: 0,
    left: 0,
  },
  stackCard2: {
    top: 3,
    left: 3,
  },
  stackCard1: {
    top: 6,
    left: 6,
  },
  pile: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: PILE_WIDTH,
    height: PILE_HEIGHT,
    backgroundColor: PILE_BG,
    borderRadius: PILE_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    cursor: 'pointer' as any,
  },
  pileActive: {
    borderWidth: 3,
    borderColor: '#f1c40f',
    shadowColor: '#f1c40f',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
    color: '#bdc3c7',
    fontWeight: 'bold',
    marginTop: 2,
  },
  drawHint: {
    fontSize: 11,
    color: '#f1c40f',
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
