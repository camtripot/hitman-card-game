import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { OnlineGameManager, RoomInfo } from '../multiplayer/OnlineGameManager';
import { GameSettings, GameSettingsData } from '../components/GameSettings';

interface LobbyScreenProps {
  route?: { params?: { settings?: GameSettingsData } };
  navigation: { navigate: (name: string, params?: any) => void };
}

export function LobbyScreen({ route, navigation }: LobbyScreenProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState<RoomInfo | null>(null);
  const [myRoomCode, setMyRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<GameSettingsData>(
    route?.params?.settings ?? { startWithAnge: false, deadCardsReturnToPile: true }
  );
  const managerRef = useRef<OnlineGameManager | null>(null);

  useEffect(() => {
    const manager = new OnlineGameManager();
    manager.connect();
    managerRef.current = manager;
    manager.onRoomUpdate((room) => setCurrentRoom(room));
    manager.onError((err) => setError(err));
    return () => {};
  }, []);

  const handleCreate = async () => {
    if (!playerName.trim()) { setError('Entre ton nom'); return; }
    setError(''); setLoading(true);
    try {
      const manager = managerRef.current!;
      const { roomCode: code } = await manager.createRoom(playerName.trim());
      setMyRoomCode(code);
      setIsHost(true);
      manager.onStateChange(() => navigation.navigate('OnlineGame', { manager }));
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Erreur de connexion');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) { setError('Entre ton nom et le code'); return; }
    setError(''); setLoading(true);
    try {
      const manager = managerRef.current!;
      await manager.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
      setMyRoomCode(roomCode.trim().toUpperCase());
      setIsHost(false);
      manager.onStateChange(() => navigation.navigate('OnlineGame', { manager }));
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Salon introuvable');
    }
    setLoading(false);
  };

  const handleStartGame = async () => {
    setError('');
    try { await managerRef.current?.startGame(settings); }
    catch (err: any) { setError(typeof err === 'string' ? err : 'Impossible de lancer'); }
  };

  const handleLeave = () => {
    managerRef.current?.leaveRoom();
    setCurrentRoom(null); setMyRoomCode(''); setIsHost(false);
  };

  // ── VUE SALON (en attente de lancement) ──
  if (currentRoom && myRoomCode) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={handleLeave}>
            <Text style={styles.backText}>← Quitter</Text>
          </Pressable>
          <Text style={styles.headerTitle}>SALON EN LIGNE</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Code du salon */}
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>CODE DU SALON</Text>
            <Text style={styles.code}>{myRoomCode}</Text>
            <Text style={styles.codeHint}>Partage ce code avec tes amis</Text>
          </View>

          {/* Liste des joueurs */}
          <Text style={styles.sectionLabel}>
            JOUEURS ({currentRoom.players.length})
          </Text>
          {currentRoom.players.map((p) => (
            <View key={p.id} style={styles.playerRow}>
              <View style={styles.playerAvatarSmall}>
                <Text style={styles.playerAvatarText}>{p.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.playerName}>
                {p.name}{p.id === currentRoom.hostId ? '  👑' : ''}
              </Text>
              <View style={[styles.statusDot, p.isConnected ? styles.connected : styles.disconnected]} />
            </View>
          ))}

          <View style={styles.divider} />

          {/* Paramètres */}
          <Text style={styles.sectionLabel}>PARAMÈTRES</Text>
          <GameSettings settings={settings} onSettingsChange={setSettings} disabled={!isHost} />

          {/* Info Hitmen */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🔫 {currentRoom.players.length - 1} Hitman{currentRoom.players.length - 1 > 1 ? 's' : ''} dans la partie
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {isHost && currentRoom.players.length >= 2 && (
            <Pressable style={styles.startBtn} onPress={handleStartGame}>
              <Text style={styles.startBtnText}>🎯 Lancer la partie</Text>
            </Pressable>
          )}
          {isHost && currentRoom.players.length < 2 && (
            <View style={styles.waitBox}>
              <Text style={styles.waitText}>En attente d'autres joueurs…</Text>
            </View>
          )}
          {!isHost && (
            <View style={styles.waitBox}>
              <Text style={styles.waitText}>En attente du host…</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // ── VUE CRÉER / REJOINDRE ──
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={styles.headerTitle}>JOUER EN LIGNE</Text>
      </View>

      <View style={styles.scroll}>
        <View style={styles.scrollContent}>
          {/* Onglets */}
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, tab === 'create' && styles.tabActive]}
              onPress={() => { setTab('create'); setError(''); }}
            >
              <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>
                Créer un salon
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, tab === 'join' && styles.tabActive]}
              onPress={() => { setTab('join'); setError(''); }}
            >
              <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>
                Rejoindre
              </Text>
            </Pressable>
          </View>

          {/* Champs */}
          <Text style={styles.sectionLabel}>TON NOM</Text>
          <TextInput
            style={styles.input}
            placeholder="Pseudonyme"
            placeholderTextColor="#2a2a3a"
            value={playerName}
            onChangeText={setPlayerName}
          />

          {tab === 'join' && (
            <>
              <Text style={styles.sectionLabel}>CODE DU SALON</Text>
              <TextInput
                style={[styles.input, styles.inputCode]}
                placeholder="ABCD"
                placeholderTextColor="#2a2a3a"
                value={roomCode}
                onChangeText={(t) => setRoomCode(t.toUpperCase())}
                maxLength={4}
                autoCapitalize="characters"
              />
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.actionBtn, loading && styles.disabled]}
            onPress={tab === 'create' ? handleCreate : handleJoin}
            disabled={loading}
          >
            <Text style={styles.actionBtnText}>
              {loading ? 'Connexion…' : tab === 'create' ? '🌐 Créer le salon' : '🚀 Rejoindre'}
            </Text>
          </Pressable>

          {tab === 'create' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Un code à 4 lettres sera généré automatiquement
              </Text>
            </View>
          )}
        </View>
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
    borderBottomColor: '#00001a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: { cursor: 'pointer' as any },
  backText: { color: '#0055cc', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#0055cc', fontSize: 20, fontWeight: '900', letterSpacing: 5 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },

  sectionLabel: {
    color: '#2a2a4a',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 10,
    marginTop: 4,
  },

  // Onglets
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: '#0a0a14',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f0f2a',
    cursor: 'pointer' as any,
  },
  tabActive: {
    backgroundColor: '#00001a',
    borderColor: '#0055cc',
    borderLeftWidth: 3,
    borderLeftColor: '#0055cc',
  },
  tabText: { color: '#2a2a5a', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#4488ff', fontWeight: '700' },

  // Inputs
  input: {
    backgroundColor: '#0f0f1a',
    color: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 4,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    marginBottom: 16,
  },
  inputCode: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    color: '#4488ff',
  },

  error: { color: '#cc3333', textAlign: 'center', marginBottom: 12, fontSize: 13 },

  actionBtn: {
    backgroundColor: '#00001a',
    borderWidth: 1,
    borderColor: '#0055cc',
    borderLeftWidth: 3,
    borderLeftColor: '#0055cc',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
    cursor: 'pointer' as any,
  },
  disabled: { opacity: 0.4 },
  actionBtnText: { color: '#4488ff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },

  // Code du salon
  codeBox: {
    backgroundColor: '#030308',
    borderRadius: 4,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#00001a',
    borderTopWidth: 3,
    borderTopColor: '#0055cc',
  },
  codeLabel: { color: '#2a2a4a', fontSize: 11, letterSpacing: 3, marginBottom: 10, fontWeight: '700' },
  code: { color: '#4488ff', fontSize: 52, fontWeight: '900', letterSpacing: 14 },
  codeHint: { color: '#1a1a3a', fontSize: 12, marginTop: 8 },

  // Joueurs
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a14',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0f0f2a',
    gap: 12,
  },
  playerAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00001a',
    borderWidth: 1,
    borderColor: '#0055cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarText: { color: '#4488ff', fontSize: 14, fontWeight: '700' },
  playerName: { flex: 1, color: '#aaa', fontSize: 15, fontWeight: '600' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  connected: { backgroundColor: '#27ae60' },
  disconnected: { backgroundColor: '#cc3333' },

  divider: { height: 1, backgroundColor: '#0a0a14', marginVertical: 20 },

  infoBox: {
    backgroundColor: '#0a0a14',
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#00001a',
    borderLeftWidth: 3,
    borderLeftColor: '#0055cc',
  },
  infoText: { color: '#2a2a5a', fontSize: 13 },

  // Footer
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#0a0a14' },
  startBtn: {
    backgroundColor: '#001a00',
    borderWidth: 1,
    borderColor: '#005500',
    borderLeftWidth: 3,
    borderLeftColor: '#00aa44',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  startBtnText: { color: '#00cc55', fontSize: 17, fontWeight: '900', letterSpacing: 2 },
  waitBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  waitText: { color: '#2a2a4a', fontSize: 14, fontStyle: 'italic' },
});
