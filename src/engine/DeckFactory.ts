import { Card, CardType, CARD_CATEGORIES } from '../models/Card';
import { DECK_COMPOSITION } from './rules';

let cardCounter = 0;

function createCard(type: CardType): Card {
  cardCounter++;
  return {
    id: `${type}-${cardCounter}`,
    type,
    category: CARD_CATEGORIES[type],
  };
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createDeck(hitmanCount?: number): Card[] {
  cardCounter = 0;
  const deck: Card[] = [];

  for (const [type, count] of Object.entries(DECK_COMPOSITION)) {
    const actualCount = (type === CardType.HITMAN && hitmanCount !== undefined)
      ? hitmanCount
      : count;
    for (let i = 0; i < actualCount; i++) {
      deck.push(createCard(type as CardType));
    }
  }

  return shuffle(deck);
}

export function dealCards(deck: Card[], numCards: number): { dealt: Card[]; remaining: Card[] } {
  const dealt = deck.slice(0, numCards);
  const remaining = deck.slice(numCards);
  return { dealt, remaining };
}
