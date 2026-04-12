import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ResultsScreenProps {
  winnerName: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function ResultsScreen({ winnerName, onPlayAgain, onGoHome }: ResultsScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.crown}>VICTOIRE</Text>
      <Text style={styles.winnerName}>{winnerName}</Text>
      <Text style={styles.subtitle}>est le dernier survivant !</Text>

      <TouchableOpacity style={styles.button} onPress={onPlayAgain}>
        <Text style={styles.buttonText}>Rejouer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={onGoHome}>
        <Text style={styles.buttonText}>Accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  crown: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1c40f',
    marginBottom: 20,
    letterSpacing: 6,
  },
  winnerName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#95a5a6',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 12,
    marginBottom: 12,
    width: '70%',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: '#34495e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
