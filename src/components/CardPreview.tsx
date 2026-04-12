import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
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
          <Text style={styles.title}>{title || 'Voyante - Top 3 de la pioche'}</Text>
          <View style={styles.cards}>
            {cards.map((card, index) => (
              <View key={card.id} style={styles.cardWrapper}>
                <Text style={styles.position}>#{index + 1}</Text>
                <CardComponent card={card} small />
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.okButton} onPress={onDismiss}>
            <Text style={styles.okText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#2c3e50',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9b59b6',
    marginBottom: 16,
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  position: {
    color: '#bdc3c7',
    fontSize: 11,
    marginBottom: 4,
  },
  okButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
  },
  okText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
