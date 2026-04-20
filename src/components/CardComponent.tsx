import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Card, CardCategory, CardType, CARD_NAMES, CARD_EMOJIS } from '../models/Card';

interface CardComponentProps {
  card: Card;
  onPress?: () => void;
  disabled?: boolean;
  small?: boolean;
  faceDown?: boolean;
  /** Si false, les De Faux sont affichés comme De Vrai (pour les spectateurs) */
  isOwnedByViewer?: boolean;
}

const CATEGORY_COLORS: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: '#2980b9',
  [CardCategory.INSTANT]: '#e67e22',
  [CardCategory.LOSING]: '#c0392b',
  [CardCategory.SAVING]: '#27ae60',
  [CardCategory.PEEK]: '#8e44ad',
};

const CATEGORY_LABELS: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: 'Fin de tour',
  [CardCategory.INSTANT]: 'Instantan\u00e9e',
  [CardCategory.LOSING]: 'Perdante',
  [CardCategory.SAVING]: 'Sauvetage',
  [CardCategory.PEEK]: 'Observation',
};

export function CardComponent({ card, onPress, disabled, small, faceDown, isOwnedByViewer = true }: CardComponentProps) {
  if (faceDown) {
    return (
      <View
        style={[
          styles.card,
          styles.faceDown,
          small ? styles.small : null,
        ]}
      >
        <Text style={[styles.faceDownQuestion, small && { fontSize: 22 }]}>?</Text>
        <Text style={[styles.faceDownLabel, small && { fontSize: 6 }]}>H</Text>
        <Text style={[styles.faceDownLabel, small && { fontSize: 6 }]}>I</Text>
        <Text style={[styles.faceDownLabel, small && { fontSize: 6 }]}>T</Text>
        <Text style={[styles.faceDownLabel, small && { fontSize: 6 }]}>M</Text>
        <Text style={[styles.faceDownLabel, small && { fontSize: 6 }]}>A</Text>
        <Text style={[styles.faceDownLabel, small && { fontSize: 6 }]}>N</Text>
      </View>
    );
  }

  // De Faux → affiché comme De Vrai pour les non-propriétaires
  const displayType = (!isOwnedByViewer && card.type === CardType.DE_FAUX)
    ? CardType.DE_VRAI
    : card.type;

  const bgColor = CATEGORY_COLORS[card.category];
  const emoji = CARD_EMOJIS[displayType];

  // Indicateur discret "FAUX" visible uniquement par le propriétaire
  const showFauxBadge = isOwnedByViewer && card.type === CardType.DE_FAUX;
  const isPlayable = !disabled;

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: bgColor },
        isPlayable ? styles.playable : styles.disabled,
        small ? styles.small : null,
        // Subtle gradient-like effect: darker border on left/top
        {
          borderLeftColor: darken(bgColor, 0.25),
          borderTopColor: darken(bgColor, 0.2),
          borderRightColor: lighten(bgColor, 0.1),
          borderBottomColor: lighten(bgColor, 0.1),
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {/* Inner glow overlay */}
      <View style={styles.innerGlow} />

      {/* Emoji — seul design visible sur la carte */}
      <Text style={[styles.emoji, small && styles.emojiSmall]}>
        {emoji}
      </Text>

      {/* Badge "FAUX" — visible seulement par le propriétaire */}
      {showFauxBadge && (
        <View style={styles.fauxBadge}>
          <Text style={styles.fauxBadgeText}>FAUX</Text>
        </View>
      )}
    </Pressable>
  );
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor(((num >> 16) & 0xff) * (1 + amount)));
  const g = Math.min(255, Math.floor(((num >> 8) & 0xff) * (1 + amount)));
  const b = Math.min(255, Math.floor((num & 0xff) * (1 + amount)));
  return `rgb(${r},${g},${b})`;
}

const styles = StyleSheet.create({
  card: {
    width: 95,
    height: 140,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
    cursor: 'pointer' as any,
  },
  small: {
    width: 70,
    height: 105,
    borderRadius: 9,
    paddingHorizontal: 4,
    paddingVertical: 5,
    marginHorizontal: 3,
    borderWidth: 2,
  },
  playable: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  disabled: {
    opacity: 0.4,
    borderColor: 'transparent',
  },
  innerGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  emoji: {
    fontSize: 52,
    textAlign: 'center',
  },
  emojiSmall: {
    fontSize: 34,
  },
  faceDown: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2.5,
    borderColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceDownQuestion: {
    fontSize: 30,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  fauxBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(200,0,0,0.85)',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  fauxBadgeText: {
    color: '#fff',
    fontSize: 6,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  faceDownLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.15)',
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
