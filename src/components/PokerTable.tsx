import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Player } from '../models/Player';
import { Card, CardType, CARD_EMOJIS, CARD_NAMES, CARD_CATEGORIES, CardCategory } from '../models/Card';

const { width: SCREEN_W } = Dimensions.get('window');
const W = Math.min(SCREEN_W, 500);

// Dimensions de la table
const TABLE_W = W * 0.70;
const TABLE_H = TABLE_W * 0.50;

// Centre absolu du composant
const CX = W / 2;
// CY doit satisfaire : CY - ERY >= 65 (espace pour avatar+nom du haut)
const ERY_BASE = TABLE_H / 2 + 52;
const CY = ERY_BASE + 68;       // 68px de marge garantie au-dessus

// Ellipse de placement des joueurs (légèrement en dehors de la table)
const ERX = W / 2 - 28;
const ERY = ERY_BASE;

// Hauteur totale du composant
const CONTAINER_H = CY + ERY + 62;

const AVATAR_COLORS = ['#c0392b','#2980b9','#27ae60','#f39c12','#9b59b6','#1abc9c','#e67e22','#16a085'];

interface PokerTableProps {
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  drawPileCount: number;
  discardPileCount: number;
  lastPlayedCardType: CardType | null;
  onDraw: () => void;
  canDraw: boolean;
}

export function PokerTable({
  players,
  currentPlayerIndex,
  direction,
  drawPileCount,
  discardPileCount,
  lastPlayedCardType,
  onDraw,
  canDraw,
}: PokerTableProps) {
  const N = players.length;

  // Position angulaire pour le joueur i (sens horaire, i=0 en bas)
  const getAngle = (i: number) => (Math.PI / 2) + (2 * Math.PI * i) / N;

  // Coordonnées absolues d'un joueur dans le container
  const getPos = (i: number) => {
    const angle = getAngle(i);
    return {
      x: CX + ERX * Math.cos(angle),
      y: CY + ERY * Math.sin(angle),
    };
  };

  return (
    <View style={[styles.container, { width: W, height: CONTAINER_H }]}>

      {/* ── TABLE OVALE ── */}
      <View style={[styles.tableOuter, {
        width: TABLE_W + 18,
        height: TABLE_H + 18,
        top: CY - TABLE_H / 2 - 9,
        left: CX - TABLE_W / 2 - 9,
      }]}>
        <View style={[styles.tableInner, { width: TABLE_W, height: TABLE_H }]}>

          {/* Indicateur de sens */}
          <Text style={styles.directionLabel}>
            {direction === 1 ? '↻' : '↺'}
          </Text>

          {/* Piles au centre */}
          <View style={styles.piles}>
            {/* Pioche */}
            <Pressable
              style={[styles.pile, styles.drawPile, canDraw && styles.drawPileActive]}
              onPress={onDraw}
              disabled={!canDraw}
            >
              <View style={styles.stackDeco1} />
              <View style={styles.stackDeco2} />
              <Text style={styles.pileEmoji}>🎴</Text>
              <Text style={styles.pileCount}>{drawPileCount}</Text>
              {canDraw && <Text style={styles.drawHint}>PIOCHER</Text>}
            </Pressable>

            {/* Défausse */}
            <View style={[styles.pile, styles.discardPile]}>
              {lastPlayedCardType ? (
                <>
                  <Text style={styles.discardEmoji}>{CARD_EMOJIS[lastPlayedCardType]}</Text>
                  <Text style={styles.discardName} numberOfLines={2}>
                    {CARD_NAMES[lastPlayedCardType]}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.emptyDiscardIcon}>○</Text>
                  <Text style={styles.emptyDiscardText}>Défausse</Text>
                </>
              )}
              <Text style={styles.pileCount}>{discardPileCount}</Text>
            </View>
          </View>

        </View>
      </View>

      {/* ── JOUEURS AUTOUR ── */}
      {players.map((player, i) => {
        const pos = getPos(i);
        const isActive = i === currentPlayerIndex;
        const isElim = player.isEliminated;
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];

        return (
          <View
            key={player.id}
            style={[styles.playerSlot, {
              left: pos.x - 36,
              top: pos.y - 38,
            }]}
          >
            {/* Anneau actif */}
            <View style={[styles.avatarRing, isActive && styles.avatarRingActive]}>
              <View style={[styles.avatar, { backgroundColor: isElim ? '#2a2a2a' : color }]}>
                <Text style={styles.avatarLetter}>{player.name.charAt(0).toUpperCase()}</Text>
                {isElim && (
                  <View style={styles.elimOverlay}>
                    <Text style={styles.elimX}>✕</Text>
                  </View>
                )}
              </View>
              {/* Badge nb cartes */}
              {!isElim && (
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{player.hand.length}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.playerName, isActive && styles.playerNameActive, isElim && styles.playerNameElim]}
              numberOfLines={1}
            >
              {player.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },

  // Table bois + feutrine
  tableOuter: {
    position: 'absolute',
    borderRadius: TABLE_H / 2 + 9,
    backgroundColor: '#3d1f00',     // Bord en bois
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  tableInner: {
    borderRadius: TABLE_H / 2,
    backgroundColor: '#0a3d1a',     // Feutrine verte foncée
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // Texture simulée avec un inner shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    borderWidth: 2,
    borderColor: '#062e12',
  },

  directionLabel: {
    position: 'absolute',
    top: 8,
    color: 'rgba(255,255,255,0.18)',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Piles au centre
  piles: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  pile: {
    width: 72,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  drawPile: {
    backgroundColor: '#061820',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  drawPileActive: {
    borderColor: '#f1c40f',
    shadowColor: '#f1c40f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  discardPile: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
  },
  // Effet de profondeur de la pioche
  stackDeco1: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 72,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#051015',
    zIndex: -1,
  },
  stackDeco2: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 72,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#040c10',
    zIndex: -2,
  },
  pileEmoji: { fontSize: 28, marginBottom: 2 },
  pileCount: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  drawHint: {
    fontSize: 8,
    color: '#f1c40f',
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },
  discardEmoji: { fontSize: 26, marginBottom: 2 },
  discardName: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  emptyDiscardIcon: { fontSize: 22, color: 'rgba(255,255,255,0.1)' },
  emptyDiscardText: { fontSize: 8, color: 'rgba(255,255,255,0.15)', marginTop: 2 },

  // Joueurs
  playerSlot: {
    position: 'absolute',
    width: 72,
    alignItems: 'center',
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarRingActive: {
    borderColor: '#f1c40f',
    shadowColor: '#f1c40f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  elimOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(200,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  elimX: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardBadge: {
    position: 'absolute',
    top: -1, right: -1,
    backgroundColor: '#c0392b',
    width: 16, height: 16, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0a3d1a',
  },
  cardBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#fff' },
  playerName: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
    maxWidth: 72,
  },
  playerNameActive: { color: '#f1c40f', fontWeight: 'bold' },
  playerNameElim: { color: '#444', textDecorationLine: 'line-through' },
});
