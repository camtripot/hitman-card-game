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
}

export interface Card {
  id: string;
  type: CardType;
  category: CardCategory;
}

export const CARD_CATEGORIES: Record<CardType, CardCategory> = {
  [CardType.VOYANTE]: CardCategory.TURN_ENDING,
  [CardType.FUITE]: CardCategory.TURN_ENDING,
  [CardType.CHANGEMENT_DE_SENS]: CardCategory.TURN_ENDING,
  [CardType.BOMBE]: CardCategory.TURN_ENDING,
  [CardType.VOLEUR]: CardCategory.TURN_ENDING,
  [CardType.DE_VRAI]: CardCategory.TURN_ENDING,
  [CardType.DE_FAUX]: CardCategory.TURN_ENDING,
  [CardType.DERNIERE_PIOCHE]: CardCategory.TURN_ENDING,
  [CardType.MIROIR]: CardCategory.INSTANT,
  [CardType.RENVOIE]: CardCategory.INSTANT,
  [CardType.METEORITE]: CardCategory.INSTANT,
  [CardType.CHAINE]: CardCategory.INSTANT,
  [CardType.STOP]: CardCategory.INSTANT,
  [CardType.HITMAN]: CardCategory.LOSING,
  [CardType.ANGE]: CardCategory.SAVING,
};

export const CARD_NAMES: Record<CardType, string> = {
  [CardType.VOYANTE]: 'Voyante',
  [CardType.FUITE]: 'Fuite',
  [CardType.CHANGEMENT_DE_SENS]: 'Changement de Sens',
  [CardType.BOMBE]: 'Bombe',
  [CardType.VOLEUR]: 'Voleur',
  [CardType.DE_VRAI]: 'De (Vrai)',
  [CardType.DE_FAUX]: 'De (Faux)',
  [CardType.DERNIERE_PIOCHE]: 'Derniere Pioche',
  [CardType.MIROIR]: 'Miroir',
  [CardType.RENVOIE]: 'Renvoie',
  [CardType.METEORITE]: 'Meteorite',
  [CardType.CHAINE]: 'Chaine',
  [CardType.STOP]: 'Stop',
  [CardType.HITMAN]: 'Hitman',
  [CardType.ANGE]: 'Ange',
};
