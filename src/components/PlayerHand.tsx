import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Card, CardCategory } from '../models/Card';
import { CardComponent } from './CardComponent';

// Ordre d'affichage : Ange → Fin de tour → Ne finit pas le tour → Instantanée → Perdante
const CATEGORY_ORDER: Record<CardCategory, number> = {
  [CardCategory.SAVING]: 0,
  [CardCategory.TURN_ENDING]: 1,
  [CardCategory.PEEK]: 2,
  [CardCategory.INSTANT]: 3,
  [CardCategory.LOSING]: 4,
};

function sortHand(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const catDiff = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    if (catDiff !== 0) return catDiff;
    // Même catégorie → regrouper les cartes identiques
    return a.type.localeCompare(b.type);
  });
}

interface PlayerHandProps {
  cards: Card[];
  playableCardIds: string[];
  onPlayCard: (cardId: string) => void;
  hidden?: boolean;
  /** false = mode spectateur : De Faux affiché comme De Vrai */
  isOwnedByViewer?: boolean;
}

export function PlayerHand({ cards, playableCardIds, onPlayCard, hidden, isOwnedByViewer = true }: PlayerHandProps) {
  if (hidden) {
    return (
      <View style={styles.container}>
        <Text style={styles.hiddenText}>{cards.length} cartes en main</Text>
      </View>
    );
  }

  const sorted = sortHand(cards);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ta main</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {sorted.map(card => (
          <CardComponent
            key={card.id}
            card={card}
            onPress={() => onPlayCard(card.id)}
            disabled={!playableCardIds.includes(card.id)}
            isOwnedByViewer={isOwnedByViewer}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    minHeight: 150,
  },
  label: {
    color: '#7f8fa6',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 14,
    marginBottom: 6,
  },
  scroll: {
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
  },
  hiddenText: {
    color: '#7f8fa6',
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 50,
    fontStyle: 'italic',
  },
});
