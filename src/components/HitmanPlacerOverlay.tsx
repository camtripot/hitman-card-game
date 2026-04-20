import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';

interface HitmanPlacerOverlayProps {
  pileSize: number;
  onPlace: (position: number) => void;
}

export function HitmanPlacerOverlay({ pileSize, onPlace }: HitmanPlacerOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, []);

  // Positions : 0 = tout en haut, pileSize = tout en bas
  const positions = Array.from({ length: pileSize + 1 }, (_, i) => i);

  const getLabel = (pos: number) => {
    if (pos === 0) return '↑ Tout en haut';
    if (pos === pileSize) return '↓ Tout en bas';
    return `Position ${pos + 1}`;
  };

  const getSublabel = (pos: number) => {
    if (pos === 0) return 'prochaine carte piochée';
    if (pos === pileSize) return 'dernière carte de la pioche';
    const pct = Math.round((pos / pileSize) * 100);
    if (pct <= 25) return 'dans le haut de la pioche';
    if (pct <= 50) return 'vers le milieu';
    if (pct <= 75) return 'vers le bas';
    return 'dans le bas de la pioche';
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.angeEmoji}>👼</Text>
        <Text style={styles.title}>L'ANGE T'A SAUVÉ</Text>
        <Text style={styles.subtitle}>Cache maintenant le Hitman dans la pioche</Text>
        <Text style={styles.hint}>Seul toi sauras où il est</Text>
      </View>

      {/* Carte Hitman */}
      <View style={styles.hitmanPreview}>
        <Text style={styles.hitmanEmoji}>💀</Text>
        <Text style={styles.hitmanLabel}>HITMAN</Text>
      </View>

      {/* Info pioche */}
      <View style={styles.pileInfo}>
        <Text style={styles.pileInfoText}>
          🂠 Pioche : {pileSize} carte{pileSize > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Liste des positions */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {positions.map((pos) => (
          <View key={pos}>
            {/* Zone d'insertion */}
            <Pressable style={styles.slotBtn} onPress={() => onPlace(pos)}>
              <View style={styles.slotLine} />
              <View style={styles.slotLabelBox}>
                <Text style={styles.slotLabel}>{getLabel(pos)}</Text>
                <Text style={styles.slotSublabel}>{getSublabel(pos)}</Text>
              </View>
              <View style={styles.slotLine} />
            </Pressable>

            {/* Dos de carte (sauf après le dernier slot) */}
            {pos < pileSize && (
              <View style={styles.cardBack}>
                <Text style={styles.cardBackText}>🂠</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050508',
    zIndex: 300,
    flexDirection: 'column',
  },

  header: {
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#0f0f1a',
  },
  angeEmoji: { fontSize: 32, marginBottom: 4 },
  title: {
    color: '#44ff88',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  hint: {
    color: '#3a3a5a',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
    letterSpacing: 1,
  },

  hitmanPreview: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f0f1a',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  hitmanEmoji: { fontSize: 28 },
  hitmanLabel: {
    color: '#cc0000',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
  },

  pileInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0a0a14',
    alignItems: 'center',
  },
  pileInfoText: { color: '#2a2a4a', fontSize: 12, fontWeight: '700', letterSpacing: 2 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 20 },

  // Zone d'insertion (clickable)
  slotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
    cursor: 'pointer' as any,
  },
  slotLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1a1a3a',
  },
  slotLabelBox: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#0a0a18',
    borderWidth: 1,
    borderColor: '#1a1a3a',
    minWidth: 160,
  },
  slotLabel: {
    color: '#4466cc',
    fontSize: 13,
    fontWeight: '700',
  },
  slotSublabel: {
    color: '#2a2a4a',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Dos de carte (séparateur visuel)
  cardBack: {
    alignItems: 'center',
    paddingVertical: 1,
  },
  cardBackText: {
    fontSize: 14,
    opacity: 0.25,
  },
});
