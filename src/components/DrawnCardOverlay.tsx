import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Card, CardType, CARD_EMOJIS } from '../models/Card';
import { CardComponent } from './CardComponent';

interface DrawnCardOverlayProps {
  card: Card;
  eventType: 'draw' | 'hitman_kill' | 'ange_save' | 'ange_choice';
  playerName: string;
  onDismiss: (choice?: 'use_ange' | 'skip_ange') => void;
}

export function DrawnCardOverlay({ card, eventType, playerName, onDismiss }: DrawnCardOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.2)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: false }),
    ]).start(() => {
      if (eventType === 'hitman_kill') {
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: false }),
          Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: false }),
          Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: false }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: false }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: false }),
        ]).start();
      }
    });
  }, []);

  const bgColor = eventType === 'hitman_kill'
    ? 'rgba(100, 0, 0, 0.97)'
    : eventType === 'ange_choice'
    ? 'rgba(60, 40, 0, 0.97)'
    : eventType === 'ange_save'
    ? 'rgba(10, 60, 20, 0.97)'
    : 'rgba(10, 10, 20, 0.97)';

  const title = eventType === 'hitman_kill'
    ? '💀 HITMAN !'
    : eventType === 'ange_choice'
    ? '🔫 HITMAN !'
    : eventType === 'ange_save'
    ? '👼 SAUVÉ !'
    : '🃏 Carte piochée';

  const subtitle = eventType === 'hitman_kill'
    ? `${playerName} est éliminé !`
    : eventType === 'ange_choice'
    ? `${playerName} a pioché un Hitman ! Tu as un Ange — que fais-tu ?`
    : eventType === 'ange_save'
    ? `${playerName} a pioché un Hitman… mais l'Ange l'a sauvé !`
    : `${playerName} a pioché :`;

  const titleColor = eventType === 'hitman_kill'
    ? '#ff4444'
    : eventType === 'ange_choice'
    ? '#ffaa00'
    : eventType === 'ange_save'
    ? '#44ff88'
    : '#6699ff';

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim, backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <Animated.View style={{
        transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
        marginVertical: 24,
      }}>
        <CardComponent card={card} disabled />
      </Animated.View>

      {eventType === 'ange_save' && (
        <Text style={styles.angeNote}>
          {CARD_EMOJIS[CardType.ANGE]} L'Ange a été défaussé
        </Text>
      )}

      {/* Choix Ange : deux boutons */}
      {eventType === 'ange_choice' ? (
        <View style={styles.choiceButtons}>
          <Pressable style={[styles.btn, styles.btnSave]} onPress={() => onDismiss('use_ange')}>
            <Text style={styles.btnText}>{CARD_EMOJIS[CardType.ANGE]} Utiliser l'Ange</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnDanger]} onPress={() => onDismiss('skip_ange')}>
            <Text style={styles.btnText}>💀 Accepter l'élimination</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.btn, eventType === 'hitman_kill' ? styles.btnDanger : styles.btnNormal]}
          onPress={() => onDismiss()}
        >
          <Text style={styles.btnText}>
            {eventType === 'hitman_kill' || eventType === 'ange_save' ? 'Continuer' : 'Mettre dans ma main'}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  angeNote: {
    color: '#44ff88',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  btn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 6,
    marginTop: 8,
    cursor: 'pointer' as any,
    minWidth: 220,
    alignItems: 'center',
  },
  choiceButtons: {
    width: '100%',
    gap: 12,
  },
  btnNormal: {
    backgroundColor: '#1a3a6a',
    borderWidth: 1,
    borderColor: '#4488cc',
  },
  btnDanger: {
    backgroundColor: '#3a0000',
    borderWidth: 1,
    borderColor: '#cc0000',
  },
  btnSave: {
    backgroundColor: '#0a3a1a',
    borderWidth: 1,
    borderColor: '#00aa44',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
