import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../models/Player';

interface PlayerRingProps {
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
}

const AVATAR_COLORS = [
  '#3498db',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#2c3e50',
];

export function PlayerRing({ players, currentPlayerIndex, direction }: PlayerRingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.direction}>
        {direction === 1 ? '🔄 Sens horaire' : '🔃 Sens anti-horaire'}
      </Text>
      <View style={styles.ring}>
        {players.map((player, index) => {
          const isActive = index === currentPlayerIndex;
          const isEliminated = player.isEliminated;
          const firstLetter = player.name.charAt(0).toUpperCase();
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

          return (
            <View
              key={player.id}
              style={[
                styles.playerContainer,
                isEliminated && styles.eliminatedContainer,
              ]}
            >
              <View
                style={[
                  styles.avatarOuter,
                  isActive && styles.avatarOuterActive,
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: isEliminated ? '#555' : avatarColor },
                  ]}
                >
                  <Text style={styles.avatarLetter}>{firstLetter}</Text>
                  {isEliminated && (
                    <View style={styles.eliminatedOverlay}>
                      <Text style={styles.eliminatedX}>✕</Text>
                    </View>
                  )}
                </View>
                {!isEliminated && (
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{player.hand.length}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.playerName,
                  isActive && styles.activePlayerName,
                  isEliminated && styles.eliminatedText,
                ]}
                numberOfLines={1}
              >
                {player.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  direction: {
    fontSize: 11,
    color: '#8899aa',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  ring: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  playerContainer: {
    alignItems: 'center',
    width: 64,
  },
  eliminatedContainer: {
    opacity: 0.45,
  },
  avatarOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarOuterActive: {
    borderColor: '#f1c40f',
    shadowColor: '#f1c40f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  eliminatedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(231, 76, 60, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eliminatedX: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#e74c3c',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1a1a2e',
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  playerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ccd6dd',
    marginTop: 4,
    textAlign: 'center',
  },
  activePlayerName: {
    color: '#f1c40f',
    fontWeight: 'bold',
  },
  eliminatedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
});
