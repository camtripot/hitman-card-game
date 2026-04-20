import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SW } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Fond : lignes de visée décoratives */}
      <View style={styles.crosshairH} />
      <View style={styles.crosshairV} />
      <View style={styles.crosshairCircle} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo / Titre */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleSmall}>— JEU DE CARTES —</Text>
          <Text style={styles.title}>HITMAN</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>Dernier survivant gagne</Text>
        </View>

        {/* Boutons */}
        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [styles.btn, styles.btnLocal, pressed && styles.btnPressed]}
            onPress={() => navigation.navigate('LocalSetup')}
          >
            <Text style={styles.btnIcon}>🎴</Text>
            <View>
              <Text style={styles.btnTitle}>Jouer en local</Text>
              <Text style={styles.btnSub}>Tous sur le même écran</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btn, styles.btnOnline, pressed && styles.btnPressed]}
            onPress={() => navigation.navigate('Lobby')}
          >
            <Text style={styles.btnIcon}>🌐</Text>
            <View>
              <Text style={styles.btnTitle}>Jouer en ligne</Text>
              <Text style={styles.btnSub}>Chacun sur son téléphone</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btn, styles.btnRules, pressed && styles.btnPressed]}
            onPress={() => navigation.navigate('Rules')}
          >
            <Text style={styles.btnIcon}>📖</Text>
            <View>
              <Text style={styles.btnTitle}>Règles du jeu</Text>
              <Text style={styles.btnSub}>Toutes les cartes expliquées</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.footer}>🎯 Elimine tes adversaires avant qu'ils ne t'éliminent</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080810',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden' as any,
  },
  // Croix de visée décorative
  crosshairH: {
    position: 'absolute',
    top: '50%' as any,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(180,0,0,0.08)',
  },
  crosshairV: {
    position: 'absolute',
    left: '50%' as any,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(180,0,0,0.08)',
  },
  crosshairCircle: {
    position: 'absolute',
    width: Math.min(SW, 400) * 0.85,
    height: Math.min(SW, 400) * 0.85,
    borderRadius: Math.min(SW, 400) * 0.85 / 2,
    borderWidth: 1,
    borderColor: 'rgba(180,0,0,0.06)',
  },
  content: {
    width: '100%',
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 52,
  },
  titleSmall: {
    color: '#4a0000',
    fontSize: 11,
    letterSpacing: 5,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: '#cc0000',
    letterSpacing: 16,
    textShadowColor: 'rgba(200,0,0,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleUnderline: {
    width: 60,
    height: 2,
    backgroundColor: '#cc0000',
    marginTop: 4,
    marginBottom: 10,
    opacity: 0.7,
  },
  subtitle: {
    color: '#4a4a6a',
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase' as any,
    fontWeight: '500',
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 4,
    gap: 16,
    cursor: 'pointer' as any,
  },
  btnLocal: {
    backgroundColor: '#1a0000',
    borderWidth: 1,
    borderColor: '#5a0000',
    borderLeftWidth: 3,
    borderLeftColor: '#cc0000',
  },
  btnOnline: {
    backgroundColor: '#00001a',
    borderWidth: 1,
    borderColor: '#00005a',
    borderLeftWidth: 3,
    borderLeftColor: '#0055cc',
  },
  btnRules: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderLeftWidth: 3,
    borderLeftColor: '#555',
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  btnIcon: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  btnTitle: {
    color: '#e8e8e8',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnSub: {
    color: '#444',
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    color: '#2a2a3a',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
