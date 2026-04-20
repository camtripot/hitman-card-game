import { CardType } from './Card';

// Images disponibles pour les cartes (require() statique obligatoire pour Expo)
const CARD_IMAGE_MAP: Partial<Record<CardType, any>> = {
  [CardType.HITMAN]:  require('../../assets/cards/Hitman.jpg'),
  [CardType.ANGE]:    require('../../assets/cards/Ange.png'),
  [CardType.VOLEUR]:  require('../../assets/cards/Voleur.png'),
  [CardType.VOYANTE]: require('../../assets/cards/Voyante.png'),
};

export function getCardImage(type: CardType): any | null {
  return CARD_IMAGE_MAP[type] ?? null;
}
