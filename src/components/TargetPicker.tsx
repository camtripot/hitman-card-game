import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Player } from '../models/Player';

interface TargetPickerProps {
  visible: boolean;
  players: Player[];
  myPlayerId: string;
  onChoose: (targetId: string) => void;
  title?: string;
}

export function TargetPicker({ visible, players, myPlayerId, onChoose, title }: TargetPickerProps) {
  const eligibleTargets = players.filter(p => !p.isEliminated && p.id !== myPlayerId);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title || 'Choisis un joueur'}</Text>
          {eligibleTargets.map(player => (
            <TouchableOpacity
              key={player.id}
              style={styles.playerButton}
              onPress={() => onChoose(player.id)}
            >
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.cardCount}>{player.hand.length} cartes</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#2c3e50',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 350,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  playerButton: {
    backgroundColor: '#34495e',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cardCount: {
    fontSize: 13,
    color: '#95a5a6',
  },
});
