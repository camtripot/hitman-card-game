import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Card, CardType, CARD_EMOJIS, CARD_NAMES, CARD_CATEGORIES, CardCategory } from '../models/Card';
import { CARD_DESCRIPTIONS } from '../models/CardDescriptions';
import { getCardImage } from '../models/CardImages';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface CardPreviewModalProps {
  card: Card | null;
  canPlay: boolean;
  isOwnedByViewer?: boolean;
  onPlay: () => void;
  onCancel: () => void;
}

const CATEGORY_COLORS: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: '#2980b9',
  [CardCategory.INSTANT]: '#e67e22',
  [CardCategory.LOSING]: '#c0392b',
  [CardCategory.SAVING]: '#27ae60',
  [CardCategory.PEEK]: '#8e44ad',
  [CardCategory.COPY]: '#17a589',
};

const CATEGORY_LABELS: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: 'Fin de tour',
  [CardCategory.INSTANT]: 'Instantanée',
  [CardCategory.LOSING]: 'Perdante',
  [CardCategory.SAVING]: 'Sauvetage',
  [CardCategory.PEEK]: 'Ne finit pas le tour',
  [CardCategory.COPY]: 'Copie',
};

export function CardPreviewModal({
  card,
  canPlay,
  isOwnedByViewer = true,
  onPlay,
  onCancel,
}: CardPreviewModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (card) {
      fadeAnim.setValue(0);
      slideAnim.setValue(40);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      ]).start();
    }
  }, [card]);

  if (!card) return null;

  // De Faux masking
  const displayType = (!isOwnedByViewer && card.type === CardType.DE_FAUX)
    ? CardType.DE_VRAI
    : card.type;

  const emoji = CARD_EMOJIS[displayType];
  const name = CARD_NAMES[displayType];
  const category = CARD_CATEGORIES[card.type];
  const bgColor = CATEGORY_COLORS[category];
  const categoryLabel = CATEGORY_LABELS[category];
  const description = CARD_DESCRIPTIONS[displayType];
  const showFauxBadge = isOwnedByViewer && card.type === CardType.DE_FAUX;
  const cardImage = getCardImage(displayType);

  return (
    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
      {/* Tap backdrop to cancel */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

      <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
        {/* ── LEFT: large card ── */}
        <Pressable
          style={[
            styles.bigCard,
            cardImage
              ? { backgroundColor: '#000', borderWidth: 0, padding: 0 }
              : { backgroundColor: bgColor, borderColor: lighten(bgColor) },
          ]}
          onPress={canPlay ? onPlay : undefined}
          disabled={!canPlay}
        >
          {cardImage ? (
            /* ── Version illustrée ── */
            <ImageBackground
              source={cardImage}
              resizeMode="cover"
              style={styles.bigCardImage}
              imageStyle={{ borderRadius: 14 }}
            >
              {canPlay && (
                <View style={styles.bigCardPlayOverlay} />
              )}
              {showFauxBadge && (
                <View style={styles.fauxBadge}>
                  <Text style={styles.fauxBadgeText}>FAUX</Text>
                </View>
              )}
              {canPlay && (
                <View style={styles.tapToPlayHint}>
                  <Text style={styles.tapToPlayText}>Appuie pour jouer</Text>
                </View>
              )}
            </ImageBackground>
          ) : (
            /* ── Version emoji (fallback) ── */
            <>
              <View style={[styles.bigCardInner, { borderColor: 'rgba(255,255,255,0.18)' }]} />
              <Text style={styles.bigEmoji}>{emoji}</Text>
              {showFauxBadge && (
                <View style={styles.fauxBadge}>
                  <Text style={styles.fauxBadgeText}>FAUX</Text>
                </View>
              )}
              {canPlay && (
                <View style={styles.tapToPlayHint}>
                  <Text style={styles.tapToPlayText}>Appuie pour jouer</Text>
                </View>
              )}
            </>
          )}
        </Pressable>

        {/* ── RIGHT: info + buttons ── */}
        <View style={styles.info}>
          <View style={[styles.categoryBadge, { backgroundColor: bgColor }]}>
            <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
          </View>

          <Text style={styles.cardName}>{name}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.buttons}>
            {canPlay && (
              <Pressable style={[styles.btn, styles.btnPlay]} onPress={onPlay}>
                <Text style={styles.btnPlayText}>▶ Jouer</Text>
              </Pressable>
            )}
            <Pressable style={[styles.btn, styles.btnCancel]} onPress={onCancel}>
              <Text style={styles.btnCancelText}>✕ Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function lighten(hex: string): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.floor(((num >> 16) & 0xff) * 1.4));
  const g = Math.min(255, Math.floor(((num >> 8) & 0xff) * 1.4));
  const b = Math.min(255, Math.floor((num & 0xff) * 1.4));
  return `rgb(${r},${g},${b})`;
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.82)',
    zIndex: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  panel: {
    flexDirection: 'row',
    gap: 16,
    maxWidth: 480,
    width: '100%',
    alignItems: 'center',
  },

  // Grande carte à gauche
  bigCard: {
    width: 130,
    height: 190,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
    flexShrink: 0,
    cursor: 'pointer' as any,
  },
  bigCardImage: {
    width: 130,
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bigCardPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.8)',
    pointerEvents: 'none' as any,
  },
  bigCardInner: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 11,
    borderWidth: 1,
  },
  bigEmoji: {
    fontSize: 68,
    textAlign: 'center',
  },
  fauxBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(200,0,0,0.9)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  fauxBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tapToPlayHint: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapToPlayText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Infos à droite
  info: {
    flex: 1,
    gap: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  description: {
    color: '#bbb',
    fontSize: 13,
    lineHeight: 20,
  },
  buttons: {
    gap: 8,
    marginTop: 6,
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  btnPlay: {
    backgroundColor: '#0a2a0a',
    borderWidth: 1.5,
    borderColor: '#00aa44',
  },
  btnPlayText: {
    color: '#00cc55',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  btnCancel: {
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: '#3a1a1a',
  },
  btnCancelText: {
    color: '#886666',
    fontSize: 13,
    fontWeight: '600',
  },
});
