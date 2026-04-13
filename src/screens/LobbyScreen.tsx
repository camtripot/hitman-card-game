import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { OnlineGameManager, RoomInfo } from '../multiplayer/OnlineGameManager';

interface LobbyScreenProps {
  navigation: {
    navigate: (name: string, params?: any) => void;
  };
}

export function LobbyScreen({ navigation }: LobbyScreenProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState<RoomInfo | null>(null);
  const [myRoomCode, setMyRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const managerRef = useRef<OnlineGameManager | null>(null);

  useEffect(() => {
    const manager = new OnlineGameManager();
    manager.connect();
    managerRef.current = manager;

    manager.onRoomUpdate((room) => {
      setCurrentRoom(room);
    });

    manager.onError((err) => {
      setError(err);
    });

    return () => {
      // Don't disconnect here — the manager may be passed to OnlineGameScreen
      // Disconnect is handled explicitly by leaveRoom() or OnlineGameScreen unmount
    };
  }, []);

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError('Entre ton nom');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const manager = managerRef.current!;
      const { roomCode: code } = await manager.createRoom(playerName.trim());
      setMyRoomCode(code);
      setIsHost(true);

      // Listen for game state to navigate to game
      manager.onStateChange((state) => {
        navigation.navigate('OnlineGame', {
          manager,
        });
      });
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Erreur de connexion');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setError('Entre ton nom et le code du salon');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const manager = managerRef.current!;
      await manager.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
      setMyRoomCode(roomCode.trim().toUpperCase());
      setIsHost(false);

      manager.onStateChange((state) => {
        navigation.navigate('OnlineGame', {
          manager,
        });
      });
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Salon introuvable');
    }
    setLoading(false);
  };

  const handleStartGame = async () => {
    setError('');
    try {
      await managerRef.current?.startGame();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Impossible de lancer');
    }
  };

  const handleLeave = () => {
    managerRef.current?.leaveRoom();
    setCurrentRoom(null);
    setMyRoomCode('');
    setIsHost(false);
  };

  // If we're in a room, show the lobby
  if (currentRoom && myRoomCode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SALON</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Code du salon</Text>
          <Text style={styles.code}>{myRoomCode}</Text>
          <Text style={styles.codeHint}>Partage ce code avec tes amis</Text>
        </View>

        <Text style={styles.playersTitle}>
          Joueurs ({currentRoom.players.length})
        </Text>
        {currentRoom.players.map((p) => (
          <View key={p.id} style={styles.playerRow}>
            <Text style={styles.playerName}>
              {p.name} {p.id === currentRoom.hostId ? '(Host)' : ''}
            </Text>
            <View style={[styles.statusDot, p.isConnected ? styles.connected : styles.disconnected]} />
          </View>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {isHost && currentRoom.players.length >= 2 && (
          <Pressable style={styles.startBtn} onPress={handleStartGame}>
            <Text style={styles.btnText}>Lancer la partie</Text>
          </Pressable>
        )}

        {isHost && currentRoom.players.length < 2 && (
          <Text style={styles.waitText}>En attente d'autres joueurs...</Text>
        )}

        {!isHost && (
          <Text style={styles.waitText}>En attente du host...</Text>
        )}

        <Pressable style={styles.leaveBtn} onPress={handleLeave}>
          <Text style={styles.btnText}>Quitter</Text>
        </Pressable>
      </View>
    );
  }

  // Create / Join screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>JOUER EN LIGNE</Text>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === 'create' && styles.activeTab]}
          onPress={() => { setTab('create'); setError(''); }}
        >
          <Text style={[styles.tabText, tab === 'create' && styles.activeTabText]}>
            Creer un salon
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'join' && styles.activeTab]}
          onPress={() => { setTab('join'); setError(''); }}
        >
          <Text style={[styles.tabText, tab === 'join' && styles.activeTabText]}>
            Rejoindre
          </Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ton nom"
        placeholderTextColor="#7f8c8d"
        value={playerName}
        onChangeText={setPlayerName}
      />

      {tab === 'join' && (
        <TextInput
          style={styles.input}
          placeholder="Code du salon (ex: ABCD)"
          placeholderTextColor="#7f8c8d"
          value={roomCode}
          onChangeText={(t) => setRoomCode(t.toUpperCase())}
          maxLength={4}
          autoCapitalize="characters"
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.actionBtn, loading && styles.disabled]}
        onPress={tab === 'create' ? handleCreate : handleJoin}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? 'Connexion...' : tab === 'create' ? 'Creer le salon' : 'Rejoindre'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.backBtn}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.backText}>Retour</Text>
      </Pressable>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 4,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabText: {
    color: '#95a5a6',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    cursor: 'pointer' as any,
  },
  disabled: {
    opacity: 0.6,
  },
  backBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  backText: {
    color: '#95a5a6',
    fontSize: 16,
  },
  // Lobby styles
  codeBox: {
    backgroundColor: '#2c3e50',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    color: '#95a5a6',
    fontSize: 14,
    marginBottom: 8,
  },
  code: {
    color: '#f1c40f',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 12,
  },
  codeHint: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 8,
  },
  playersTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connected: {
    backgroundColor: '#27ae60',
  },
  disconnected: {
    backgroundColor: '#e74c3c',
  },
  startBtn: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    cursor: 'pointer' as any,
  },
  leaveBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    cursor: 'pointer' as any,
  },
  waitText: {
    color: '#95a5a6',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    fontStyle: 'italic',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
