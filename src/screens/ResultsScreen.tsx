import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface ResultsScreenProps {
  winnerName: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function ResultsScreen({ winnerName, onPlayAgain, onGoHome }: ResultsScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.confettiTop}>🎉 🎊 🏆 🎊 🎉</Text>

      <View style={styles.crownContainer}>
        <Text style={styles.crownEmoji}>👑</Text>
      </View>

      <Text style={styles.victoryLabel}>VICTOIRE</Text>
      <Text style={styles.winnerName}>{winnerName}</Text>
      <Text style={styles.subtitle}>est le dernier survivant !</Text>

      <Text style={styles.confettiBottom}>🎉 🏆 🎊 🏆 🎉</Text>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.playAgainButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onPlayAgain}
        >
          <Text style={styles.buttonText}>🔄 Rejouer</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.homeButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onGoHome}
        >
          <Text style={styles.buttonText}>🏠 Accueil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confettiTop: {
    fontSize: 28,
    marginBottom: 20,
    letterSpacing: 8,
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(241, 196, 15, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(241, 196, 15, 0.3)',
  },
  crownEmoji: {
    fontSize: 40,
  },
  victoryLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1c40f',
    marginBottom: 12,
    letterSpacing: 8,
  },
  winnerName: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(241, 196, 15, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 17,
    color: '#8899aa',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  confettiBottom: {
    fontSize: 22,
    marginBottom: 40,
    letterSpacing: 6,
  },
  buttonsContainer: {
    width: '75%',
    maxWidth: 300,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  playAgainButton: {
    backgroundColor: '#27ae60',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  homeButton: {
    backgroundColor: '#2a3a4e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
