import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { MIN_PLAYERS, MAX_PLAYERS } from '../engine/rules';
import { GameSettings, GameSettingsData } from '../components/GameSettings';

interface LocalSetupScreenProps {
  navigation: any;
}

export function LocalSetupScreen({ navigation }: LocalSetupScreenProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [settings, setSettings] = useState<GameSettingsData>({
    startWithAnge: false,
    deadCardsReturnToPile: true,
  });

  const addPlayer = () => {
    if (playerNames.length < MAX_PLAYERS) setPlayerNames([...playerNames, '']);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > MIN_PLAYERS)
      setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const updateName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const startGame = () => {
    const names = playerNames.map((n, i) => n.trim() || `Joueur ${i + 1}`);
    if (names.length < MIN_PLAYERS) {
      if (Platform.OS === 'web') window.alert(`Il faut au moins ${MIN_PLAYERS} joueurs`);
      return;
    }
    navigation.navigate('Game', { playerNames: names, mode: 'local', settings });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={styles.title}>PARTIE LOCALE</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Joueurs */}
        <Text style={styles.sectionLabel}>JOUEURS ({playerNames.length}/{MAX_PLAYERS})</Text>
        {playerNames.map((name, index) => (
          <View key={index} style={styles.playerRow}>
            <View style={styles.playerIndex}>
              <Text style={styles.playerIndexText}>{index + 1}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={`Joueur ${index + 1}`}
              placeholderTextColor="#3a3a4a"
              value={name}
              onChangeText={(text) => updateName(index, text)}
            />
            {playerNames.length > MIN_PLAYERS && (
              <Pressable style={styles.removeBtn} onPress={() => removePlayer(index)}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            )}
          </View>
        ))}

        {playerNames.length < MAX_PLAYERS && (
          <Pressable style={styles.addBtn} onPress={addPlayer}>
            <Text style={styles.addText}>+ Ajouter un joueur</Text>
          </Pressable>
        )}

        <View style={styles.divider} />

        {/* Paramètres */}
        <Text style={styles.sectionLabel}>PARAMÈTRES</Text>
        <GameSettings settings={settings} onSettingsChange={setSettings} />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🔫 {playerNames.length - 1} Hitman{playerNames.length - 1 > 1 ? 's' : ''} dans la partie
          </Text>
        </View>
      </ScrollView>

      {/* Bouton lancer */}
      <View style={styles.footer}>
        <Pressable style={styles.startBtn} onPress={startGame}>
          <Text style={styles.startText}>🎯 Lancer la partie</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080810',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a0000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    cursor: 'pointer' as any,
  },
  backText: {
    color: '#cc0000',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#cc0000',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  sectionLabel: {
    color: '#3a3a5a',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  playerIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a0000',
    borderWidth: 1,
    borderColor: '#3a0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerIndexText: {
    color: '#cc0000',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    color: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 4,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#1a0000',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  removeText: {
    color: '#cc0000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
    cursor: 'pointer' as any,
  },
  addText: {
    color: '#333355',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#0f0f1a',
    marginVertical: 20,
  },
  infoBox: {
    backgroundColor: '#0f0f1a',
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1a0000',
    borderLeftWidth: 3,
    borderLeftColor: '#cc0000',
  },
  infoText: {
    color: '#555',
    fontSize: 13,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#0f0f1a',
  },
  startBtn: {
    backgroundColor: '#7a0000',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cc0000',
    cursor: 'pointer' as any,
  },
  startText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
