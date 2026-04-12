import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HandRevealScreenProps {
  playerName: string;
  onReady: () => void;
}

export function HandRevealScreen({ playerName, onReady }: HandRevealScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passe le telephone a</Text>
      <Text style={styles.playerName}>{playerName}</Text>
      <TouchableOpacity style={styles.button} onPress={onReady}>
        <Text style={styles.buttonText}>Je suis pret !</Text>
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
  title: {
    fontSize: 22,
    color: '#95a5a6',
    marginBottom: 12,
  },
  playerName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f1c40f',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#27ae60',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
