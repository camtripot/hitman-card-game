import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Card, CardCategory, CARD_NAMES } from '../models/Card';

interface CardComponentProps {
  card: Card;
  onPress?: () => void;
  disabled?: boolean;
  small?: boolean;
  faceDown?: boolean;
}

const CATEGORY_COLORS: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: '#3498db',
  [CardCategory.INSTANT]: '#e67e22',
  [CardCategory.LOSING]: '#e74c3c',
  [CardCategory.SAVING]: '#2ecc71',
};

export function CardComponent({ card, onPress, disabled, small, faceDown }: CardComponentProps) {
  if (faceDown) {
    return (
      <View style={[styles.card, styles.faceDown, small && styles.small]}>
        <Text style={styles.faceDownText}>?</Text>
      </View>
    );
  }

  const bgColor = CATEGORY_COLORS[card.category];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: bgColor },
        disabled && styles.disabled,
        small && styles.small,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.cardName, small && styles.smallText]} numberOfLines={2}>
        {CARD_NAMES[card.type]}
      </Text>
      <Text style={[styles.categoryLabel, small && styles.smallCategory]}>
        {card.category === CardCategory.TURN_ENDING ? 'Fin de tour' :
         card.category === CardCategory.INSTANT ? 'Instantanee' :
         card.category === CardCategory.LOSING ? 'Perdante' : 'Sauvetage'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 90,
    height: 130,
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  small: {
    width: 65,
    height: 95,
    padding: 4,
  },
  faceDown: {
    backgroundColor: '#2c3e50',
  },
  faceDownText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
  cardName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  smallText: {
    fontSize: 10,
  },
  categoryLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  smallCategory: {
    fontSize: 7,
  },
});
