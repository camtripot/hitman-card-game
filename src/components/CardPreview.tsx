import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Card } from '../models/Card';
import { CardComponent } from './CardComponent';

interface CardPreviewProps {
  visible: boolean;
  cards: Card[];
  onDismiss: () => void;
  title?: string;
}

export function CardPreview({ visible, cards, onDismiss, title }: CardPreviewProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            🔮 {title || 'Voyante - Top 3 de la pioche'}
          </Text>
          <View style={styles.cards}>
            {cards.map((card, index) => (
              <View key={card.id} style={styles.cardWrapper}>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{index + 1}</Text>
                </View>
                <CardComponent card={card} small />
              </View>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.okButton,
              pressed && styles.okButtonPressed,
            ]}
            onPress={onDismiss}
          >
            <Text style={styles.okText}>Compris !</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#08080f',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120, 70, 200, 0.25)',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#aa88ff',
    marginBottom: 18,
    letterSpacing: 2,
    textTransform: 'uppercase' as any,
  },
  cards: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 22,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  positionBadge: {
    backgroundColor: '#150d28',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#4422aa',
  },
  positionText: {
    color: '#aa88ff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  okButton: {
    paddingVertical: 12,
    paddingHorizontal: 52,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4422aa',
    backgroundColor: '#0a0514',
    cursor: 'pointer' as any,
    minWidth: 200,
    alignItems: 'center',
  },
  okButtonPressed: {
    backgroundColor: '#150d28',
    transform: [{ scale: 0.97 }],
  },
  okText: {
    color: '#aa88ff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
