import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
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
      <View style={styles.urgencyBar} />
      <View style={styles.container}>
        <Text style={styles.title}>⚡ Reaction !</Text>
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

        <Pressable
          style={({ pressed }) => [
            styles.passButton,
            pressed && styles.passButtonPressed,
          ]}
          onPress={onPass}
        >
          <Text style={styles.passText}>Passer</Text>
        </Pressable>
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
    backgroundColor: 'rgba(40, 15, 0, 0.95)',
    paddingBottom: 30,
    borderTopWidth: 2,
    borderTopColor: '#e67e22',
  },
  urgencyBar: {
    height: 3,
    backgroundColor: '#e74c3c',
  },
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#bdc3c7',
    marginBottom: 14,
  },
  cardList: {
    marginBottom: 14,
  },
  passButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e74c3c',
    cursor: 'pointer' as any,
  },
  passButtonPressed: {
    backgroundColor: '#962d22',
    transform: [{ scale: 0.97 }],
  },
  passText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
