import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Card } from '../models/Card';
import { CardComponent } from './CardComponent';

interface PlayerHandProps {
  cards: Card[];
  playableCardIds: string[];
  onPlayCard: (cardId: string) => void;
  hidden?: boolean;
}

export function PlayerHand({ cards, playableCardIds, onPlayCard, hidden }: PlayerHandProps) {
  if (hidden) {
    return (
      <View style={styles.container}>
        <Text style={styles.hiddenText}>{cards.length} cartes en main</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ta main</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {cards.map(card => (
          <CardComponent
            key={card.id}
            card={card}
            onPress={() => onPlayCard(card.id)}
            disabled={!playableCardIds.includes(card.id)}
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
