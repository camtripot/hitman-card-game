import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { CardType, CardCategory, CARD_EMOJIS, CARD_NAMES, CARD_CATEGORIES } from '../models/Card';
import { CARD_DESCRIPTIONS } from '../models/CardDescriptions';

interface RulesScreenProps {
  navigation: any;
}

const CATEGORY_COLORS: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: '#1a5276',
  [CardCategory.INSTANT]:     '#7d4e00',
  [CardCategory.LOSING]:      '#7b241c',
  [CardCategory.SAVING]:      '#1d6a39',
  [CardCategory.PEEK]:        '#512e8a',
};
const CATEGORY_TEXT: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: '#4ab3f4',
  [CardCategory.INSTANT]:     '#f5a623',
  [CardCategory.LOSING]:      '#ff6b6b',
  [CardCategory.SAVING]:      '#4cde8a',
  [CardCategory.PEEK]:        '#c39cf5',
};
const CATEGORY_LABELS: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: 'Fin de tour',
  [CardCategory.INSTANT]:     'Instantanée',
  [CardCategory.LOSING]:      'Perdante',
  [CardCategory.SAVING]:      'Sauvetage',
  [CardCategory.PEEK]:        'Ne finit pas le tour',
};

const ALL_CARDS: CardType[] = [
  CardType.HITMAN,
  CardType.ANGE,
  CardType.VOYANTE,
  CardType.VOLEUR,
  CardType.DE_VRAI,
  CardType.DE_FAUX,
  CardType.FUITE,
  CardType.CHANGEMENT_DE_SENS,
  CardType.BOMBE,
  CardType.DERNIERE_PIOCHE,
  CardType.MIROIR,
  CardType.METEORITE,
  CardType.CHAINE,
  CardType.STOP,
  CardType.RENVOIE,
];

const FILTER_TABS: { key: CardCategory | 'all'; label: string }[] = [
  { key: 'all',                   label: 'Toutes' },
  { key: CardCategory.TURN_ENDING, label: 'Fin de tour' },
  { key: CardCategory.PEEK,        label: 'PEEK' },
  { key: CardCategory.INSTANT,     label: 'Instant.' },
  { key: CardCategory.LOSING,      label: 'Perdante' },
  { key: CardCategory.SAVING,      label: 'Sauvetage' },
];

export function RulesScreen({ navigation }: RulesScreenProps) {
  const [filter, setFilter] = useState<CardCategory | 'all'>('all');

  const visible = ALL_CARDS.filter(t =>
    filter === 'all' || CARD_CATEGORIES[t] === filter
  );

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={styles.headerTitle}>RÈGLES</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ── BUT DU JEU ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯  But du jeu</Text>
          <Text style={styles.bodyText}>
            Le <Text style={styles.accent}>dernier survivant</Text> gagne la partie.{'\n'}
            À ton tour tu dois faire <Text style={styles.accent}>une</Text> de ces deux actions :
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bullet}>
              <Text style={styles.bulletDot}>▸</Text>
              <Text style={styles.bulletText}><Text style={styles.accent}>Piocher</Text> une carte en haut de la pioche</Text>
            </View>
            <View style={styles.bullet}>
              <Text style={styles.bulletDot}>▸</Text>
              <Text style={styles.bulletText}><Text style={styles.accent}>Jouer</Text> une carte de fin de tour ou PEEK depuis ta main</Text>
            </View>
          </View>
        </View>

        {/* ── CATÉGORIES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋  Catégories de cartes</Text>

          {(Object.keys(CATEGORY_LABELS) as CardCategory[]).map(cat => (
            <View key={cat} style={[styles.categoryRow, { borderLeftColor: CATEGORY_TEXT[cat] }]}>
              <View style={[styles.catBadge, { backgroundColor: CATEGORY_COLORS[cat] }]}>
                <Text style={[styles.catBadgeText, { color: CATEGORY_TEXT[cat] }]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </View>
              <Text style={styles.categoryDesc}>
                {cat === CardCategory.TURN_ENDING && 'Jouable pendant ton tour — met fin à ton tour.'}
                {cat === CardCategory.PEEK        && "Jouable pendant ton tour — ton tour CONTINUE ensuite."}
                {cat === CardCategory.INSTANT     && 'Jouable à tout moment (réaction), même pendant le tour d\'un autre joueur. Miroir, Chaîne et Météorite sont aussi jouables pendant ton propre tour si une carte a déjà été posée.'}
                {cat === CardCategory.LOSING      && 'Piocher cette carte t\'élimine immédiatement (sauf Ange).'}
                {cat === CardCategory.SAVING      && 'Te protège automatiquement si tu pioches un Hitman.'}
              </Text>
            </View>
          ))}
        </View>

        {/* ── CARTES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🃏  Les cartes</Text>

          {/* Filtres */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {FILTER_TABS.map(tab => (
              <Pressable
                key={tab.key}
                style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
                onPress={() => setFilter(tab.key)}
              >
                <Text style={[styles.filterTabText, filter === tab.key && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {visible.map(type => {
            const cat = CARD_CATEGORIES[type];
            return (
              <View key={type} style={[styles.cardBox, { borderLeftColor: CATEGORY_TEXT[cat] }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>{CARD_EMOJIS[type]}</Text>
                  <Text style={styles.cardName}>{CARD_NAMES[type]}</Text>
                  <View style={[styles.catBadge, { backgroundColor: CATEGORY_COLORS[cat] }]}>
                    <Text style={[styles.catBadgeText, { color: CATEGORY_TEXT[cat] }]}>
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{CARD_DESCRIPTIONS[type]}</Text>
              </View>
            );
          })}
        </View>

        {/* ── RÈGLES AVANCÉES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡  Fenêtre de réaction</Text>
          <Text style={styles.bodyText}>
            Après chaque carte jouée (fin de tour ou ciblante), une <Text style={styles.accent}>fenêtre de réaction</Text> s'ouvre.
            Les autres joueurs peuvent alors jouer une carte instantanée pour modifier ou annuler l'effet.
            La fenêtre se ferme quand tout le monde a passé, et l'effet se résout.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💣  Bombe & cumul de tours</Text>
          <Text style={styles.bodyText}>
            La Bombe force un joueur à jouer à ta place. Il hérite de tes tours restants{' '}
            <Text style={styles.accent}>plus 2</Text> tours supplémentaires. Si tu avais 1 tour restant,
            la cible doit jouer 3 fois d'affilée.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗  Chaîne</Text>
          <Text style={styles.bodyText}>
            Une carte Chaîne bloque un type de carte pendant{' '}
            <Text style={styles.accent}>3 tours de joueurs</Text>. Personne ne peut la jouer ou la faire
            jouer pendant cette durée.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🪞  Miroir sur ton tour</Text>
          <Text style={styles.bodyText}>
            Le Miroir, la Chaîne et la Météorite peuvent être joués{' '}
            <Text style={styles.accent}>pendant ton propre tour</Text> si au moins une carte se trouve
            dans la pile de défausse. Ils copient / enchaînent / retirent la dernière carte jouée.
          </Text>
        </View>

      </ScrollView>
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
    borderBottomColor: '#0d0d20',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: { cursor: 'pointer' as any },
  backText: { color: '#0055cc', fontSize: 14, fontWeight: '600' },
  headerTitle: {
    color: '#0055cc',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 5,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 40 },

  section: { marginBottom: 28 },

  sectionTitle: {
    color: '#4488ff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
    textTransform: 'uppercase' as any,
  },

  bodyText: {
    color: '#7a7a9a',
    fontSize: 13,
    lineHeight: 21,
  },
  accent: { color: '#aabbff', fontWeight: '700' },

  bulletList: { marginTop: 10, gap: 8 },
  bullet: { flexDirection: 'row', gap: 10 },
  bulletDot: { color: '#0055cc', fontSize: 13, fontWeight: '700', marginTop: 1 },
  bulletText: { color: '#7a7a9a', fontSize: 13, lineHeight: 19, flex: 1 },

  // Catégories
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#0a0a16',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  catBadge: {
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  catBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  categoryDesc: { color: '#6a6a8a', fontSize: 12, lineHeight: 18, flex: 1 },

  // Filtres
  filterRow: { marginBottom: 12 },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0a0a16',
    borderWidth: 1,
    borderColor: '#0f0f2a',
    marginRight: 8,
    cursor: 'pointer' as any,
  },
  filterTabActive: {
    backgroundColor: '#00001a',
    borderColor: '#0055cc',
  },
  filterTabText: { color: '#2a2a5a', fontSize: 12, fontWeight: '600' },
  filterTabTextActive: { color: '#4488ff', fontWeight: '700' },

  // Cartes
  cardBox: {
    backgroundColor: '#0a0a16',
    borderRadius: 4,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  cardEmoji: { fontSize: 22 },
  cardName: { color: '#ccccee', fontSize: 15, fontWeight: '800', flex: 1 },
  cardDesc: { color: '#5a5a7a', fontSize: 12, lineHeight: 18 },
});
