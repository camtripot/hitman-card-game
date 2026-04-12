import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../models/Card';
import { CardComponent } from './CardComponent';
import { isInstant } from '../engine/CardEffects';

interface ReactionOverlayProps {
  visible: boolean;
  cards: Card[];
  playableCardIds: string[];
  onReact: (cardId: string) => void;
  onPass: () => void;
  canReact: boolean;
}

export function ReactionOverlay({
  visible,
  cards,
  playableCardIds,
  onReact,
  onPass,
  canReact,
}: ReactionOverlayProps) {
  if (!visible) return null;

  const instantCards = cards.filter(c => isInstant(c.type));

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Fenetre de reaction !</Text>
        <Text style={styles.subtitle}>Joue une carte instantanee ou passe</Text>

        {instantCards.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardList}>
            {instantCards.map(card => (
              <CardComponent
                key={card.id}
                card={card}
                small
                onPress={() => onReact(card.id)}
                disabled={!playableCardIds.includes(card.id)}
              />
            ))}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.passButton} onPress={onPass}>
          <Text style={styles.passText}>Passer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingBottom: 30,
  },
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#bdc3c7',
    marginBottom: 12,
  },
  cardList: {
    marginBottom: 12,
  },
  passButton: {
    backgroundColor: '#7f8c8d',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  passText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
