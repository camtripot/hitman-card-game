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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1e2a3a',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.3)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bb86fc',
    marginBottom: 18,
    letterSpacing: 0.3,
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
    backgroundColor: '#9b59b6',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  positionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  okButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 13,
    paddingHorizontal: 55,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bb86fc',
    cursor: 'pointer' as any,
  },
  okButtonPressed: {
    backgroundColor: '#7d3c98',
    transform: [{ scale: 0.97 }],
  },
  okText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
