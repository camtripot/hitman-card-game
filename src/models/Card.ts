export enum CardType {
  VOYANTE = 'voyante',
  FUITE = 'fuite',
  CHANGEMENT_DE_SENS = 'changement_de_sens',
  BOMBE = 'bombe',
  VOLEUR = 'voleur',
  DE_VRAI = 'de_vrai',
  DE_FAUX = 'de_faux',
  DERNIERE_PIOCHE = 'derniere_pioche',
  MIROIR = 'miroir',
  RENVOIE = 'renvoie',
  METEORITE = 'meteorite',
  CHAINE = 'chaine',
  STOP = 'stop',
  HITMAN = 'hitman',
  ANGE = 'ange',
}

export enum CardCategory {
  TURN_ENDING = 'turn_ending',
  INSTANT = 'instant',
  LOSING = 'losing',
  SAVING = 'saving',
  PEEK = 'peek',   // Jouable pendant son tour, ne finit PAS le tour
  COPY = 'copy',   // Copie la dernière carte jouée, uniquement pendant son tour
}

export interface Card {
  id: string;
  type: CardType;
  category: CardCategory;
}

export const CARD_CATEGORIES: Record<CardType, CardCategory> = {
  [CardType.VOYANTE]: CardCategory.PEEK,
  [CardType.FUITE]: CardCategory.TURN_ENDING,
  [CardType.CHANGEMENT_DE_SENS]: CardCategory.TURN_ENDING,
  [CardType.BOMBE]: CardCategory.TURN_ENDING,
  [CardType.VOLEUR]: CardCategory.TURN_ENDING,
  [CardType.DE_VRAI]: CardCategory.PEEK,
  [CardType.DE_FAUX]: CardCategory.PEEK,
  [CardType.DERNIERE_PIOCHE]: CardCategory.TURN_ENDING,
  [CardType.MIROIR]: CardCategory.COPY,
  [CardType.RENVOIE]: CardCategory.INSTANT,
  [CardType.METEORITE]: CardCategory.INSTANT,
  [CardType.CHAINE]: CardCategory.INSTANT,
  [CardType.STOP]: CardCategory.INSTANT,
  [CardType.HITMAN]: CardCategory.LOSING,
  [CardType.ANGE]: CardCategory.SAVING,
};

export const CARD_EMOJIS: Record<CardType, string> = {
  [CardType.VOYANTE]: '\u{1F52E}',
  [CardType.FUITE]: '\u{1F3C3}',
  [CardType.CHANGEMENT_DE_SENS]: '\u{1F504}',
  [CardType.BOMBE]: '\u{1F4A3}',
  [CardType.VOLEUR]: '\u{1F9B9}',
  [CardType.DE_VRAI]: '\u{1F3B2}',
  [CardType.DE_FAUX]: '\u{1F3B2}',   // Même emoji que DE_VRAI pour les autres joueurs
  [CardType.DERNIERE_PIOCHE]: '\u{1F4E5}',
  [CardType.MIROIR]: '\u{1FA9E}',
  [CardType.RENVOIE]: '\u21A9\uFE0F',
  [CardType.METEORITE]: '\u2604\uFE0F',
  [CardType.CHAINE]: '\u26D3\uFE0F',
  [CardType.STOP]: '\u{1F6D1}',
  [CardType.HITMAN]: '\u{1F52B}',
  [CardType.ANGE]: '\u{1F47C}',
};

export const CARD_NAMES: Record<CardType, string> = {
  [CardType.VOYANTE]: 'Voyante',
  [CardType.FUITE]: 'Fuite',
  [CardType.CHANGEMENT_DE_SENS]: 'Changement de Sens',
  [CardType.BOMBE]: 'Bombe',
  [CardType.VOLEUR]: 'Voleur',
  [CardType.DE_VRAI]: 'De',
  [CardType.DE_FAUX]: 'De',   // Affiché identique au De Vrai pour les non-propriétaires
  [CardType.DERNIERE_PIOCHE]: 'Derniere Pioche',
  [CardType.MIROIR]: 'Miroir',
  [CardType.RENVOIE]: 'Renvoie',
  [CardType.METEORITE]: 'Meteorite',
  [CardType.CHAINE]: 'Chaine',
  [CardType.STOP]: 'Stop',
  [CardType.HITMAN]: 'Hitman',
  [CardType.ANGE]: 'Ange',
};
