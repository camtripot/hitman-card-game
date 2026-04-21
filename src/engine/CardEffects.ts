import { CardType, CardCategory, CARD_CATEGORIES } from '../models/Card';
import { GameState, GamePhase, PendingEffect } from '../models/GameState';
import { shuffle } from './DeckFactory';
import { CHAIN_DURATION_TURNS, VOYANTE_CARDS_COUNT } from './rules';

export interface EffectResult {
  state: GameState;
  nextPhase: GamePhase;
  /** Si true, l'annulation d'un effet ne fait pas avancer le tour */
  keepTurn?: boolean;
}

export type EffectHandler = (
  state: GameState,
  effect: PendingEffect
) => EffectResult;

const effectHandlers: Map<CardType, EffectHandler> = new Map();

function registerEffect(cardType: CardType, handler: EffectHandler) {
  effectHandlers.set(cardType, handler);
}

export function getEffectHandler(cardType: CardType): EffectHandler | undefined {
  return effectHandlers.get(cardType);
}

export function needsTarget(cardType: CardType): boolean {
  return cardType === CardType.BOMBE || cardType === CardType.VOLEUR;
}

export function isInstant(cardType: CardType): boolean {
  return CARD_CATEGORIES[cardType] === CardCategory.INSTANT;
}

// --- Turn-ending card effects ---

registerEffect(CardType.FUITE, (state, _effect) => {
  return { state, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION };
});

registerEffect(CardType.CHANGEMENT_DE_SENS, (state, _effect) => {
  const newState: GameState = {
    ...state,
    direction: (state.direction === 1 ? -1 : 1) as 1 | -1,
    lastEvent: {
      type: 'direction_changed',
      message: `Le sens de jeu a été inversé !`,
    },
  };
  return { state: newState, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION };
});

registerEffect(CardType.VOYANTE, (state, effect) => {
  const topCards = state.drawPile.slice(0, VOYANTE_CARDS_COUNT);
  const newState: GameState = {
    ...state,
    voyanteCards: topCards,
    lastEvent: {
      type: 'voyante',
      playerId: effect.sourcePlayerId,
      message: `regarde les ${VOYANTE_CARDS_COUNT} cartes du dessus de la pioche`,
    },
  };
  return { state: newState, nextPhase: GamePhase.VIEWING_VOYANTE };
});

registerEffect(CardType.BOMBE, (state, effect) => {
  if (!effect.targetPlayerId) {
    return { state, nextPhase: GamePhase.AWAITING_TARGET };
  }

  const targetIndex = state.players.findIndex(p => p.id === effect.targetPlayerId);
  const newState: GameState = {
    ...state,
    currentPlayerIndex: targetIndex,
    mustPlayCount: state.mustPlayCount + 2,
    lastEvent: {
      type: 'bombe',
      playerId: effect.sourcePlayerId,
      targetPlayerId: effect.targetPlayerId,
      message: `a envoyé une bombe à ${state.players[targetIndex].name} !`,
    },
  };
  return { state: newState, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION };
});

registerEffect(CardType.VOLEUR, (state, effect) => {
  if (!effect.targetPlayerId) {
    return { state, nextPhase: GamePhase.AWAITING_TARGET };
  }

  const newState: GameState = {
    ...state,
    lastEvent: {
      type: 'voleur',
      playerId: effect.sourcePlayerId,
      targetPlayerId: effect.targetPlayerId,
      message: `vole une carte à ${state.players.find(p => p.id === effect.targetPlayerId)?.name} !`,
    },
  };
  return { state: newState, nextPhase: GamePhase.AWAITING_CARD_CHOICE };
});

registerEffect(CardType.DE_VRAI, (state, _effect) => {
  const newState: GameState = {
    ...state,
    drawPile: shuffle(state.drawPile),
    lastEvent: {
      type: 'shuffle',
      message: `La pioche a été mélangée !`,
    },
  };
  return { state: newState, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION };
});

registerEffect(CardType.DE_FAUX, (state, _effect) => {
  // Fake shuffle: don't actually shuffle, but show the same message
  const newState: GameState = {
    ...state,
    lastEvent: {
      type: 'shuffle',
      message: `La pioche a été mélangée !`,
    },
  };
  return { state: newState, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION };
});

registerEffect(CardType.DERNIERE_PIOCHE, (state, effect) => {
  if (state.drawPile.length === 0) {
    return { state, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION };
  }

  const lastCard = state.drawPile[state.drawPile.length - 1];
  const newDrawPile = state.drawPile.slice(0, -1);
  const player = state.players.find(p => p.id === effect.sourcePlayerId)!;

  // Check if drawn card is Hitman
  if (lastCard.type === CardType.HITMAN) {
    const hasAnge = player.hand.some(c => c.type === CardType.ANGE);
    if (hasAnge) {
      // Ange sauve le joueur — il doit choisir où remettre le Hitman
      const angeCard = player.hand.find(c => c.type === CardType.ANGE)!;
      const newHand = player.hand.filter(c => c.id !== angeCard.id);
      const newPlayers = state.players.map(p =>
        p.id === player.id ? { ...p, hand: newHand } : p
      );
      return {
        state: {
          ...state,
          drawPile: newDrawPile,
          discardPile: [...state.discardPile, angeCard],
          players: newPlayers,
          pendingHitmanCard: lastCard,
          lastEvent: {
            type: 'ange_save',
            playerId: player.id,
            message: `${player.name} a pioché un Hitman mais a été sauvé par un Ange !`,
          },
        },
        nextPhase: GamePhase.CHOOSING_HITMAN_POSITION,
      };
    } else {
      // Joueur éliminé — le Hitman repart à une position aléatoire dans la pioche
      const randomPos = Math.floor(Math.random() * (newDrawPile.length + 1));
      const newDrawPileWithHitman = [
        ...newDrawPile.slice(0, randomPos),
        lastCard,
        ...newDrawPile.slice(randomPos),
      ];
      const newPlayers = state.players.map(p =>
        p.id === player.id ? { ...p, isEliminated: true } : p
      );
      return {
        state: {
          ...state,
          drawPile: newDrawPileWithHitman,
          players: newPlayers,
          eliminatedPlayerId: player.id,
          lastEvent: {
            type: 'hitman_kill',
            playerId: player.id,
            message: `${player.name} a pioché un Hitman et est éliminé !`,
          },
        },
        nextPhase: GamePhase.PLAYER_ELIMINATED,
      };
    }
  }

  // Normal card: add to hand (type 'draw' pour déclencher l'overlay)
  const newPlayers = state.players.map(p =>
    p.id === player.id ? { ...p, hand: [...p.hand, lastCard] } : p
  );
  return {
    state: {
      ...state,
      drawPile: newDrawPile,
      players: newPlayers,
      lastEvent: {
        type: 'draw',
        playerId: player.id,
        message: `${player.name} a pioché la dernière carte de la pioche`,
      },
    },
    nextPhase: GamePhase.WAITING_FOR_TURN_ACTION,
  };
});

// --- Instant card effects ---

registerEffect(CardType.STOP, (state, _effect) => {
  // effectStack = [..., cancelledEffect, stopEffect]
  // Remove both Stop itself AND the cancelled effect below it
  const newStack = state.effectStack.slice(0, -2);
  const newState: GameState = {
    ...state,
    effectStack: newStack,
    lastEvent: {
      type: 'stop',
      message: `L'effet a été annulé par un Stop !`,
    },
  };
  return { state: newState, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION, keepTurn: true };
});

registerEffect(CardType.MIROIR, (state, effect) => {
  // Copy the top effect on the stack, but with the mirror player as source
  if (state.effectStack.length === 0) {
    return { state, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION };
  }

  const topEffect = state.effectStack[state.effectStack.length - 1];
  const copiedEffect: PendingEffect = {
    ...topEffect,
    sourcePlayerId: effect.sourcePlayerId,
    cardInstanceId: effect.cardInstanceId,
    resolved: false,
  };

  const newState: GameState = {
    ...state,
    effectStack: [...state.effectStack, copiedEffect],
    lastEvent: {
      type: 'miroir',
      playerId: effect.sourcePlayerId,
      message: `a copié l'effet avec un Miroir !`,
    },
  };

  // If the copied effect needs a target, go to target selection
  if (needsTarget(topEffect.cardType) && !copiedEffect.targetPlayerId) {
    return { state: newState, nextPhase: GamePhase.AWAITING_TARGET };
  }

  return { state: newState, nextPhase: GamePhase.REACTION_WINDOW };
});

registerEffect(CardType.RENVOIE, (state, effect) => {
  if (state.effectStack.length === 0) {
    return { state, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION };
  }

  // The player who played Renvoie becomes the new source, and gets to choose target
  const topEffect = state.effectStack[state.effectStack.length - 1];
  const modifiedEffect: PendingEffect = {
    ...topEffect,
    sourcePlayerId: effect.sourcePlayerId,
    targetPlayerId: undefined, // Reset target so the renvoie player can choose
    resolved: false,
  };

  const newStack = [...state.effectStack.slice(0, -1), modifiedEffect];
  const newState: GameState = {
    ...state,
    effectStack: newStack,
    lastEvent: {
      type: 'renvoie',
      playerId: effect.sourcePlayerId,
      message: `a renvoyé l'effet !`,
    },
  };

  if (needsTarget(topEffect.cardType)) {
    return { state: newState, nextPhase: GamePhase.AWAITING_TARGET };
  }

  return { state: newState, nextPhase: GamePhase.REACTION_WINDOW };
});

registerEffect(CardType.METEORITE, (state, _effect) => {
  if (state.effectStack.length < 2) {
    return { state, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION, keepTurn: true };
  }

  // effectStack = [..., cancelledEffect, meteoriteEffect]
  // The target is the effect BELOW Meteorite (length-2)
  const targetEffect = state.effectStack[state.effectStack.length - 2];
  const cancelledCardType = targetEffect.cardType;
  // Remove both Meteorite and the cancelled effect
  const newStack = state.effectStack.slice(0, -2);

  // Remove all cards of that type from all hands and put them back in draw pile
  const removedCards: typeof state.drawPile = [];
  const newPlayers = state.players.map(p => {
    const kept = p.hand.filter(c => c.type !== cancelledCardType);
    const removed = p.hand.filter(c => c.type === cancelledCardType);
    removedCards.push(...removed);
    return { ...p, hand: kept };
  });

  const newDrawPile = shuffle([...state.drawPile, ...removedCards]);

  const newState: GameState = {
    ...state,
    effectStack: newStack,
    players: newPlayers,
    drawPile: newDrawPile,
    lastEvent: {
      type: 'meteorite',
      cardType: cancelledCardType,
      message: `Météorite ! L'effet est annulé et toutes les cartes ${cancelledCardType} sont retournées dans la pioche !`,
    },
  };
  return { state: newState, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION, keepTurn: true };
});

registerEffect(CardType.CHAINE, (state, _effect) => {
  if (state.effectStack.length < 2) {
    return { state, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION, keepTurn: true };
  }

  // effectStack = [..., originalCardEffect, chaineEffect]
  // Block the ORIGINAL card (length-2), not Chaîne itself (length-1)
  const targetEffect = state.effectStack[state.effectStack.length - 2];
  const chainedType = targetEffect.cardType;

  // Remove both Chaîne and the original card from the stack
  const newStack = state.effectStack.slice(0, -2);

  // Add chain entry — block this card type for 3 player-turns
  const newChained = [
    ...state.chainedCards,
    { cardType: chainedType, turnsRemaining: CHAIN_DURATION_TURNS },
  ];

  const newState: GameState = {
    ...state,
    effectStack: newStack,
    chainedCards: newChained,
    lastEvent: {
      type: 'chaine',
      cardType: chainedType,
      message: `Les cartes ${chainedType} sont enchaînées pour ${CHAIN_DURATION_TURNS} tours !`,
    },
  };
  return { state: newState, nextPhase: GamePhase.WAITING_FOR_TURN_ACTION, keepTurn: true };
});
