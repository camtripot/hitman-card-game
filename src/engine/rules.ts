import { CardType } from '../models/Card';

export const DECK_COMPOSITION: Record<CardType, number> = {
  [CardType.VOYANTE]: 4,
  [CardType.FUITE]: 4,
  [CardType.CHANGEMENT_DE_SENS]: 3,
  [CardType.BOMBE]: 2,
  [CardType.VOLEUR]: 3,
  [CardType.DE_VRAI]: 2,
  [CardType.DE_FAUX]: 2,
  [CardType.DERNIERE_PIOCHE]: 2,
  [CardType.MIROIR]: 3,
  [CardType.RENVOIE]: 3,
  [CardType.METEORITE]: 2,
  [CardType.CHAINE]: 2,
  [CardType.STOP]: 3,
  [CardType.HITMAN]: 4,
  [CardType.ANGE]: 4,
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;
export const CHAIN_DURATION_TURNS = 3;
export const VOYANTE_CARDS_COUNT = 3;
export const DEFAULT_CARDS_PER_PLAYER = 4;
export const REACTION_TIMEOUT_MS = 10000;
export const MAX_EFFECT_STACK_DEPTH = 10;

export const TARGETING_CARDS: CardType[] = [
  CardType.BOMBE,
  CardType.VOLEUR,
];

export const NEEDS_TARGET: Record<string, boolean> = {
  [CardType.BOMBE]: true,
  [CardType.VOLEUR]: true,
};
