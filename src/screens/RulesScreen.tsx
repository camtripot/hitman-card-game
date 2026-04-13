import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { CardType, CardCategory, CARD_EMOJIS, CARD_NAMES, CARD_CATEGORIES } from '../models/Card';

interface RulesScreenProps {
  navigation: any;
}

const CATEGORY_LABELS: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: 'Fin de tour',
  [CardCategory.INSTANT]: 'Instantanee',
  [CardCategory.LOSING]: 'Perdante',
  [CardCategory.SAVING]: 'Sauvetage',
};

const CATEGORY_COLORS: Record<CardCategory, string> = {
  [CardCategory.TURN_ENDING]: '#27ae60',
  [CardCategory.INSTANT]: '#f39c12',
  [CardCategory.LOSING]: '#e74c3c',
  [CardCategory.SAVING]: '#3498db',
};

const CARD_DESCRIPTIONS: Record<CardType, string> = {
  [CardType.VOYANTE]: 'Regarde les 3 cartes du dessus de la pioche',
  [CardType.FUITE]: 'Passe ton tour',
  [CardType.CHANGEMENT_DE_SENS]: 'Inverse le sens du jeu et passe le tour',
  [CardType.BOMBE]: 'Choisis un joueur, c\'est son tour et il doit jouer 2 fois',
  [CardType.VOLEUR]: 'Choisis un joueur, il te donne une carte',
  [CardType.DE_VRAI]: 'Melange la pioche',
  [CardType.DE_FAUX]: 'Fait semblant de melanger (seul toi le sais)',
  [CardType.DERNIERE_PIOCHE]: 'Pioche la derniere carte de la pioche',
  [CardType.MIROIR]: 'Copie l\'effet de la derniere carte jouee',
  [CardType.RENVOIE]: 'Redirige une carte ciblante vers un autre joueur',
  [CardType.METEORITE]: 'Annule la derniere carte et retire toutes ses copies des mains',
  [CardType.CHAINE]: 'Bloque une carte pendant 3 tours',
  [CardType.STOP]: 'Annule l\'effet de la derniere carte jouee',
  [CardType.HITMAN]: 'Si piochee, tu es elimine (sauf si tu as un Ange)',
  [CardType.ANGE]: 'Te sauve automatiquement d\'un Hitman',
};

const ALL_CARD_TYPES: CardType[] = [
  CardType.VOYANTE,
  CardType.FUITE,
  CardType.CHANGEMENT_DE_SENS,
  CardType.BOMBE,
  CardType.VOLEUR,
  CardType.DE_VRAI,
  CardType.DE_FAUX,
  CardType.DERNIERE_PIOCHE,
  CardType.MIROIR,
  CardType.RENVOIE,
  CardType.METEORITE,
  CardType.CHAINE,
  CardType.STOP,
  CardType.HITMAN,
  CardType.ANGE,
];

export function RulesScreen({ navigation }: RulesScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{'\u{1F4D6}'} REGLES DU JEU</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>But du jeu</Text>
          <Text style={styles.sectionText}>
            Le dernier survivant gagne la partie. A ton tour, tu peux soit piocher une carte, soit jouer une carte de fin de tour.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Les cartes</Text>
          {ALL_CARD_TYPES.map((type) => {
            const category = CARD_CATEGORIES[type];
            const categoryColor = CATEGORY_COLORS[category];
            return (
              <View key={type} style={styles.cardBox}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>{CARD_EMOJIS[type]}</Text>
                  <Text style={styles.cardName}>{CARD_NAMES[type]}</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                    <Text style={styles.categoryText}>{CATEGORY_LABELS[category]}</Text>
                  </View>
                </View>
                <Text style={styles.cardDescription}>{CARD_DESCRIPTIONS[type]}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cartes instantanees</Text>
          <Text style={styles.sectionText}>
            Les cartes Miroir, Renvoie, Meteorite, Chaine et Stop peuvent etre jouees pendant les fenetres de reaction, meme pendant le tour d'un autre joueur.
          </Text>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ecf0f1',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#bdc3c7',
    lineHeight: 24,
  },
  cardBox: {
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8e44ad',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  cardEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  cardName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginRight: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    color: '#bdc3c7',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#8e44ad',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    cursor: 'pointer' as any,
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
