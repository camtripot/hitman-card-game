import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface HandRevealScreenProps {
  playerName: string;
  onReady: () => void;
}

export function HandRevealScreen({ playerName, onReady }: HandRevealScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.phoneEmoji}>📱</Text>
      <Text style={styles.title}>Passe le telephone a</Text>
      <View style={styles.nameContainer}>
        <Text style={styles.playerName}>{playerName}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={onReady}
      >
        <Text style={styles.buttonText}>Je suis pret !</Text>
      </Pressable>
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
  phoneEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#8899aa',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  nameContainer: {
    marginBottom: 50,
  },
  playerName: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#f1c40f',
    textAlign: 'center',
    textShadowColor: 'rgba(241, 196, 15, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  button: {
    backgroundColor: '#27ae60',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2ecc71',
    cursor: 'pointer' as any,
  },
  buttonPressed: {
    backgroundColor: '#1e8c4c',
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
