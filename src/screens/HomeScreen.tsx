import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MIN_PLAYERS, MAX_PLAYERS } from '../engine/rules';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);

  const addPlayer = () => {
    if (playerNames.length < MAX_PLAYERS) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > MIN_PLAYERS) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updateName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const startGame = () => {
    const names = playerNames.map((n, i) => n.trim() || `Joueur ${i + 1}`);
    if (names.length < MIN_PLAYERS) {
      Alert.alert('Erreur', `Il faut au moins ${MIN_PLAYERS} joueurs`);
      return;
    }
    navigation.navigate('Game', { playerNames: names, mode: 'local' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HITMAN</Text>
      <Text style={styles.subtitle}>Jeu de cartes</Text>

      <ScrollView style={styles.playerList}>
        {playerNames.map((name, index) => (
          <View key={index} style={styles.playerRow}>
            <TextInput
              style={styles.input}
              placeholder={`Joueur ${index + 1}`}
              placeholderTextColor="#7f8c8d"
              value={name}
              onChangeText={(text) => updateName(index, text)}
            />
            {playerNames.length > MIN_PLAYERS && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePlayer(index)}
              >
                <Text style={styles.removeText}>X</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {playerNames.length < MAX_PLAYERS && (
        <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
          <Text style={styles.addText}>+ Ajouter un joueur</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startText}>Jouer en local</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.startButton, styles.onlineButton]}
        onPress={() => Alert.alert('Bientot', 'Le mode en ligne arrive bientot !')}
      >
        <Text style={styles.startText}>Jouer en ligne</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 30,
  },
  playerList: {
    maxHeight: 300,
  },
  playerRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2c3e50',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: '#e74c3c',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  onlineButton: {
    backgroundColor: '#2980b9',
  },
  startText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
