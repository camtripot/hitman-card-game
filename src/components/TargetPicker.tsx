import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Player } from '../models/Player';

interface TargetPickerProps {
  visible: boolean;
  players: Player[];
  myPlayerId: string;
  onChoose: (targetId: string) => void;
  title?: string;
}

const TARGET_COLORS = [
  '#3498db',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#2c3e50',
];

export function TargetPicker({ visible, players, myPlayerId, onChoose, title }: TargetPickerProps) {
  const eligibleTargets = players.filter(p => !p.isEliminated && p.id !== myPlayerId);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🎯 {title || 'Choisis un joueur'}</Text>
          <View style={styles.targetList}>
            {eligibleTargets.map((player, index) => {
              const firstLetter = player.name.charAt(0).toUpperCase();
              const color = TARGET_COLORS[index % TARGET_COLORS.length];
              return (
                <Pressable
                  key={player.id}
                  style={({ pressed }) => [
                    styles.playerButton,
                    pressed && styles.playerButtonPressed,
                  ]}
                  onPress={() => onChoose(player.id)}
                >
                  <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarLetter}>{firstLetter}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.cardCount}>{player.hand.length} cartes</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1e2a3a',
    borderRadius: 18,
    padding: 24,
    width: '82%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  targetList: {
    gap: 10,
  },
  playerButton: {
    backgroundColor: '#2a3a4e',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    cursor: 'pointer' as any,
  },
  playerButtonPressed: {
    backgroundColor: '#3a4f6a',
    transform: [{ scale: 0.98 }],
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cardCount: {
    fontSize: 12,
    color: '#7f8fa6',
    marginTop: 1,
  },
  arrow: {
    fontSize: 24,
    color: '#7f8fa6',
    fontWeight: '300',
  },
});
