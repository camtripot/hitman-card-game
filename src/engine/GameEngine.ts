import { Card, CardType, CardCategory, CARD_CATEGORIES } from '../models/Card';
import { Player } from '../models/Player';
import {
  GameState,
  GamePhase,
  GameConfig,
  DEFAULT_CONFIG,
  PendingEffect,
} from '../models/GameState';
import { PlayerAction } from '../models/Actions';
import { createDeck, dealCards, shuffle } from './DeckFactory';
import { getEffectHandler, needsTarget, isInstant } from './CardEffects';
import { DEFAULT_CARDS_PER_PLAYER, CHAIN_DURATION_TURNS } from './rules';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export class GameEngine {
  static createGame(config: Partial<GameConfig> = {}): GameState {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const { playerNames, cardsPerPlayer } = fullConfig;

    const hitmanCount = playerNames.length - 1;
    let deck = createDeck(hitmanCount);
    const players: Player[] = [];

    for (const name of playerNames) {
      // Deal cards but exclude Hitman from starting hands
      let hand: Card[] = [];
      let remaining = deck;
      while (hand.length < cardsPerPlayer && remaining.length > 0) {
        const card = remaining[0];
        remaining = remaining.slice(1);
        if (card.type === CardType.HITMAN) {
          // Put Hitman back at a random position in the deck
          const pos = Math.floor(Math.random() * (remaining.length + 1));
          remaining = [...remaining.slice(0, pos), card, ...remaining.slice(pos)];
        } else {
          hand.push(card);
        }
      }
      deck = remaining;

      // If startWithAnge is enabled, give each player a free extra Ange card
      if (fullConfig.startWithAnge) {
        const extraAnge: Card = {
          id: `ange-extra-${generateId()}`,
          type: CardType.ANGE,
          category: CARD_CATEGORIES[CardType.ANGE],
        };
        hand.push(extraAnge);
      }

      players.push({
        id: generateId(),
        name,
        hand,
        isEliminated: false,
        isConnected: true,
      });
    }

    return {
      id: generateId(),
      players,
      drawPile: deck,
      discardPile: [],
      currentPlayerIndex: 0,
      direction: 1,
      phase: GamePhase.WAITING_FOR_TURN_ACTION,
      effectStack: [],
      chainedCards: [],
      turnCount: 0,
      mustPlayCount: 1,
      reactionWindow: null,
      lastEvent: null,
      winner: null,
      voyanteCards: [],
      lastPlayedCardType: null,
      eliminatedPlayerId: null,
      config: fullConfig,
    };
  }

  static dispatch(state: GameState, action: PlayerAction): GameState {
    switch (action.type) {
      case 'DRAW_CARD':
        return GameEngine.handleDrawCard(state, action.playerId, false);
      case 'DRAW_CARD_SKIP_ANGE':
        return GameEngine.handleDrawCard(state, action.playerId, true);
      case 'PLAY_CARD':
        return GameEngine.handlePlayCard(state, action.playerId, action.cardInstanceId);
      case 'CHOOSE_TARGET':
        return GameEngine.handleChooseTarget(state, action.playerId, action.targetPlayerId);
      case 'CHOOSE_CARD_TO_GIVE':
        return GameEngine.handleChooseCardToGive(state, action.playerId, action.cardInstanceId);
      case 'REACT_WITH_CARD':
        return GameEngine.handleReactWithCard(state, action.playerId, action.cardInstanceId);
      case 'PASS_REACTION':
        return GameEngine.handlePassReaction(state, action.playerId);
      case 'ACKNOWLEDGE_VOYANTE':
        return GameEngine.handleAcknowledgeVoyante(state, action.playerId);
      default:
        return state;
    }
  }

  static getValidActions(state: GameState, playerId: string): PlayerAction[] {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.isEliminated) return [];

    const actions: PlayerAction[] = [];
    const currentPlayer = state.players[state.currentPlayerIndex];

    switch (state.phase) {
      case GamePhase.WAITING_FOR_TURN_ACTION: {
        if (currentPlayer.id !== playerId) break;

        // Can draw
        if (state.drawPile.length > 0) {
          actions.push({ type: 'DRAW_CARD', playerId });
        }

        // Can play turn-ending cards AND peek cards
        for (const card of player.hand) {
          const cat = CARD_CATEGORIES[card.type];
          const isChained = state.chainedCards.some(c => c.cardType === card.type);
          if (isChained) continue;

          if (cat === CardCategory.TURN_ENDING || cat === CardCategory.PEEK) {
            actions.push({ type: 'PLAY_CARD', playerId, cardInstanceId: card.id });
          }

          // Miroir, Chaîne, Météorite also playable on your turn if discard pile is not empty
          if (
            cat === CardCategory.INSTANT &&
            state.lastPlayedCardType !== null &&
            (card.type === CardType.MIROIR || card.type === CardType.CHAINE || card.type === CardType.METEORITE)
          ) {
            actions.push({ type: 'PLAY_CARD', playerId, cardInstanceId: card.id });
          }
        }
        break;
      }

      case GamePhase.REACTION_WINDOW: {
        if (!state.reactionWindow) break;
        if (!state.reactionWindow.eligiblePlayerIds.includes(playerId)) break;
        if (state.reactionWindow.passedPlayerIds.includes(playerId)) break;

        // Can play instant cards
        for (const card of player.hand) {
          if (isInstant(card.type)) {
            const isChained = state.chainedCards.some(c => c.cardType === card.type);
            if (!isChained) {
              actions.push({ type: 'REACT_WITH_CARD', playerId, cardInstanceId: card.id });
            }
          }
        }

        // Can always pass
        actions.push({ type: 'PASS_REACTION', playerId });
        break;
      }

      case GamePhase.AWAITING_TARGET: {
        const topEffect = state.effectStack[state.effectStack.length - 1];
        if (!topEffect || topEffect.sourcePlayerId !== playerId) break;

        // Can choose any non-eliminated player except self
        for (const p of state.players) {
          if (!p.isEliminated && p.id !== playerId) {
            actions.push({ type: 'CHOOSE_TARGET', playerId, targetPlayerId: p.id });
          }
        }
        break;
      }

      case GamePhase.AWAITING_CARD_CHOICE: {
        // The target of Voleur must choose a card to give
        const topEffect = state.effectStack[state.effectStack.length - 1];
        if (!topEffect || topEffect.targetPlayerId !== playerId) break;

        for (const card of player.hand) {
          actions.push({ type: 'CHOOSE_CARD_TO_GIVE', playerId, cardInstanceId: card.id });
        }
        break;
      }

      case GamePhase.VIEWING_VOYANTE: {
        if (currentPlayer.id !== playerId) break;
        actions.push({ type: 'ACKNOWLEDGE_VOYANTE', playerId });
        break;
      }
    }

    return actions;
  }

  static isGameOver(state: GameState): boolean {
    return state.phase === GamePhase.GAME_OVER;
  }

  // --- Private handlers ---

  private static handleDrawCard(state: GameState, playerId: string, skipAnge = false): GameState {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.id !== playerId || state.phase !== GamePhase.WAITING_FOR_TURN_ACTION) {
      return state;
    }
    if (state.drawPile.length === 0) return state;

    const drawnCard = state.drawPile[0];
    const newDrawPile = state.drawPile.slice(1);

    // Check if drawn card is Hitman
    if (drawnCard.type === CardType.HITMAN) {
      const hasAnge = currentPlayer.hand.some(c => c.type === CardType.ANGE);

      if (hasAnge && !skipAnge) {
        const angeCard = currentPlayer.hand.find(c => c.type === CardType.ANGE)!;
        const newHand = currentPlayer.hand.filter(c => c.id !== angeCard.id);
        const newPlayers = state.players.map(p =>
          p.id === playerId ? { ...p, hand: newHand } : p
        );
        const newState: GameState = {
          ...state,
          drawPile: newDrawPile,
          discardPile: [...state.discardPile, drawnCard, angeCard],
          players: newPlayers,
          lastEvent: {
            type: 'ange_save',
            playerId,
            message: `${currentPlayer.name} a pioché un Hitman mais a été sauvé par un Ange !`,
          },
        };
        return GameEngine.advanceTurn(newState);
      } else {
        // Player is eliminated
        const newPlayers = state.players.map(p =>
          p.id === playerId ? { ...p, isEliminated: true } : p
        );
        const newState: GameState = {
          ...state,
          drawPile: newDrawPile,
          discardPile: [...state.discardPile, drawnCard],
          players: newPlayers,
          eliminatedPlayerId: playerId,
          lastEvent: {
            type: 'hitman_kill',
            playerId,
            message: `${currentPlayer.name} a pioché un Hitman et est éliminé !`,
          },
        };
        return GameEngine.checkElimination(newState);
      }
    }

    // Normal card: add to hand and advance turn
    const newPlayers = state.players.map(p =>
      p.id === playerId ? { ...p, hand: [...p.hand, drawnCard] } : p
    );
    const newState: GameState = {
      ...state,
      drawPile: newDrawPile,
      players: newPlayers,
      lastEvent: {
        type: 'draw',
        playerId,
        message: `${currentPlayer.name} a pioché une carte`,
      },
    };
    return GameEngine.advanceTurn(newState);
  }

  private static handlePlayCard(state: GameState, playerId: string, cardInstanceId: string): GameState {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.id !== playerId || state.phase !== GamePhase.WAITING_FOR_TURN_ACTION) {
      return state;
    }

    const card = currentPlayer.hand.find(c => c.id === cardInstanceId);
    const cardCat = card ? CARD_CATEGORIES[card.type] : null;

    // Miroir/Chaîne/Météorite also valid on your turn when discard pile is not empty
    const isInstantOnTurn = cardCat === CardCategory.INSTANT &&
      state.lastPlayedCardType !== null &&
      (card?.type === CardType.MIROIR || card?.type === CardType.CHAINE || card?.type === CardType.METEORITE);

    if (!card || (cardCat !== CardCategory.TURN_ENDING && cardCat !== CardCategory.PEEK && !isInstantOnTurn)) return state;

    // Check if card is chained
    if (state.chainedCards.some(c => c.cardType === card.type)) return state;

    // Remove card from hand, add to discard
    const newHand = currentPlayer.hand.filter(c => c.id !== cardInstanceId);
    const newPlayers = state.players.map(p =>
      p.id === playerId ? { ...p, hand: newHand } : p
    );

    const effect: PendingEffect = {
      sourcePlayerId: playerId,
      cardType: card.type,
      cardInstanceId: card.id,
      resolved: false,
    };

    const newState: GameState = {
      ...state,
      players: newPlayers,
      discardPile: [...state.discardPile, card],
      effectStack: [effect],
      lastPlayedCardType: card.type,
      lastEvent: {
        type: 'play_card',
        playerId,
        cardType: card.type,
        message: `${currentPlayer.name} a joué ${card.type}`,
      },
    };

    // INSTANT cards played on your own turn (Miroir, Chaîne, Météorite)
    if (isInstantOnTurn) {
      const targetType = state.lastPlayedCardType!;

      if (card.type === CardType.CHAINE) {
        const newChained = [
          ...newState.chainedCards,
          { cardType: targetType, turnsRemaining: CHAIN_DURATION_TURNS },
        ];
        return GameEngine.advanceTurn({
          ...newState,
          effectStack: [],
          chainedCards: newChained,
          lastEvent: {
            type: 'chaine',
            cardType: targetType,
            message: `Les cartes ${targetType} sont enchaînées pour ${CHAIN_DURATION_TURNS} tours !`,
          },
        });
      }

      if (card.type === CardType.METEORITE) {
        const removedCards: Card[] = [];
        const players = newState.players.map(p => {
          const kept = p.hand.filter(c => c.type !== targetType);
          const removed = p.hand.filter(c => c.type === targetType);
          removedCards.push(...removed);
          return { ...p, hand: kept };
        });
        const newDrawPile = shuffle([...newState.drawPile, ...removedCards]);
        return GameEngine.advanceTurn({
          ...newState,
          effectStack: [],
          players,
          drawPile: newDrawPile,
          lastEvent: {
            type: 'meteorite',
            cardType: targetType,
            message: `Météorite ! Toutes les cartes ${targetType} sont retirées des mains !`,
          },
        });
      }

      if (card.type === CardType.MIROIR) {
        const mirrorEffect: PendingEffect = {
          sourcePlayerId: playerId,
          cardType: targetType,
          cardInstanceId: card.id,
          resolved: false,
        };
        const mirrorState: GameState = {
          ...newState,
          effectStack: [mirrorEffect],
          lastEvent: {
            type: 'miroir',
            playerId,
            message: `${currentPlayer.name} a copié l'effet de ${targetType} avec un Miroir !`,
          },
        };
        if (needsTarget(targetType)) {
          return { ...mirrorState, phase: GamePhase.AWAITING_TARGET };
        }
        const handler = getEffectHandler(targetType);
        if (handler) {
          const result = handler(mirrorState, mirrorEffect);
          if (result.nextPhase === GamePhase.AWAITING_TARGET) {
            return { ...result.state, effectStack: [mirrorEffect], phase: GamePhase.AWAITING_TARGET };
          }
          return GameEngine.openReactionWindow(result.state, mirrorEffect);
        }
        return GameEngine.openReactionWindow(mirrorState, mirrorEffect);
      }

      return state; // fallback
    }

    // PEEK cards : pas de fenêtre de réaction, directement l'effet
    if (cardCat === CardCategory.PEEK) {
      const handler = getEffectHandler(card.type);
      if (handler) {
        const result = handler(newState, effect);
        // If the effect still needs a target (Voleur) or card choice, keep the stack
        if (result.nextPhase === GamePhase.AWAITING_TARGET) {
          return { ...result.state, effectStack: [effect], phase: GamePhase.AWAITING_TARGET };
        }
        if (result.nextPhase === GamePhase.AWAITING_CARD_CHOICE) {
          return { ...result.state, effectStack: [effect], phase: GamePhase.AWAITING_CARD_CHOICE };
        }
        return { ...result.state, effectStack: [], phase: result.nextPhase ?? GamePhase.WAITING_FOR_TURN_ACTION };
      }
      return { ...newState, effectStack: [], phase: GamePhase.WAITING_FOR_TURN_ACTION };
    }

    // Si la carte nécessite une cible, aller à la sélection de cible
    if (needsTarget(card.type)) {
      return { ...newState, phase: GamePhase.AWAITING_TARGET };
    }

    // Ouvrir fenêtre de réaction
    return GameEngine.openReactionWindow(newState, effect);
  }

  private static handleChooseTarget(state: GameState, playerId: string, targetPlayerId: string): GameState {
    if (state.phase !== GamePhase.AWAITING_TARGET) return state;

    const topEffect = state.effectStack[state.effectStack.length - 1];
    if (!topEffect || topEffect.sourcePlayerId !== playerId) return state;

    const target = state.players.find(p => p.id === targetPlayerId);
    if (!target || target.isEliminated || target.id === playerId) return state;

    const updatedEffect: PendingEffect = { ...topEffect, targetPlayerId };
    const newStack = [...state.effectStack.slice(0, -1), updatedEffect];
    const newState: GameState = { ...state, effectStack: newStack };

    // PEEK cards (Voleur) skip the reaction window — resolve directly
    const cardCat = CARD_CATEGORIES[topEffect.cardType];
    if (cardCat === CardCategory.PEEK) {
      const handler = getEffectHandler(topEffect.cardType);
      if (handler) {
        const result = handler(newState, updatedEffect);
        if (result.nextPhase === GamePhase.AWAITING_CARD_CHOICE) {
          return { ...result.state, effectStack: newStack, phase: GamePhase.AWAITING_CARD_CHOICE };
        }
        return { ...result.state, effectStack: [], phase: result.nextPhase ?? GamePhase.WAITING_FOR_TURN_ACTION };
      }
    }

    // Open reaction window with the target set
    return GameEngine.openReactionWindow(newState, updatedEffect);
  }

  private static handleChooseCardToGive(state: GameState, playerId: string, cardInstanceId: string): GameState {
    if (state.phase !== GamePhase.AWAITING_CARD_CHOICE) return state;

    const topEffect = state.effectStack[state.effectStack.length - 1];
    if (!topEffect || topEffect.targetPlayerId !== playerId) return state;

    const targetPlayer = state.players.find(p => p.id === playerId)!;
    const card = targetPlayer.hand.find(c => c.id === cardInstanceId);
    if (!card) return state;

    const thiefId = topEffect.sourcePlayerId;

    // Transfer the card
    const newPlayers = state.players.map(p => {
      if (p.id === playerId) {
        return { ...p, hand: p.hand.filter(c => c.id !== cardInstanceId) };
      }
      if (p.id === thiefId) {
        return { ...p, hand: [...p.hand, card] };
      }
      return p;
    });

    const newState: GameState = {
      ...state,
      players: newPlayers,
      effectStack: [],
      lastEvent: {
        type: 'voleur_give',
        playerId: thiefId,
        targetPlayerId: playerId,
        message: `${targetPlayer.name} a donné une carte au voleur`,
      },
    };

    // Voleur is PEEK: stay on the thief's turn (don't advance)
    return { ...newState, phase: GamePhase.WAITING_FOR_TURN_ACTION };
  }

  private static handleReactWithCard(state: GameState, playerId: string, cardInstanceId: string): GameState {
    if (state.phase !== GamePhase.REACTION_WINDOW || !state.reactionWindow) return state;
    if (!state.reactionWindow.eligiblePlayerIds.includes(playerId)) return state;

    const player = state.players.find(p => p.id === playerId)!;
    const card = player.hand.find(c => c.id === cardInstanceId);
    if (!card || !isInstant(card.type)) return state;

    // Check if chained
    if (state.chainedCards.some(c => c.cardType === card.type)) return state;

    // Remove card from hand, add to discard
    const newHand = player.hand.filter(c => c.id !== cardInstanceId);
    const newPlayers = state.players.map(p =>
      p.id === playerId ? { ...p, hand: newHand } : p
    );

    const effect: PendingEffect = {
      sourcePlayerId: playerId,
      cardType: card.type,
      cardInstanceId: card.id,
      resolved: false,
    };

    const newState: GameState = {
      ...state,
      players: newPlayers,
      discardPile: [...state.discardPile, card],
      effectStack: [...state.effectStack, effect],
      reactionWindow: null,
      lastPlayedCardType: card.type,
      lastEvent: {
        type: 'react',
        playerId,
        cardType: card.type,
        message: `${player.name} a joué ${card.type} en réaction !`,
      },
    };

    // Resolve the instant effect
    const handler = getEffectHandler(card.type);
    if (handler) {
      const result = handler(newState, effect);
      // If the effect leads to more interaction, return that state
      if (result.nextPhase === GamePhase.AWAITING_TARGET) {
        return { ...result.state, phase: GamePhase.AWAITING_TARGET };
      }
      if (result.nextPhase === GamePhase.REACTION_WINDOW) {
        return GameEngine.openReactionWindow(result.state, effect);
      }
      // Otherwise, resolve remaining effects on the stack or advance
      return GameEngine.resolveStackOrAdvance(result.state);
    }

    return newState;
  }

  private static handlePassReaction(state: GameState, playerId: string): GameState {
    if (state.phase !== GamePhase.REACTION_WINDOW || !state.reactionWindow) return state;
    if (!state.reactionWindow.eligiblePlayerIds.includes(playerId)) return state;

    const newPassed = [...state.reactionWindow.passedPlayerIds, playerId];
    const allPassed = state.reactionWindow.eligiblePlayerIds.every(id => newPassed.includes(id));

    if (allPassed) {
      // Everyone passed — resolve the top effect
      const newState: GameState = {
        ...state,
        reactionWindow: null,
      };
      return GameEngine.resolveTopEffect(newState);
    }

    // Not everyone passed yet
    return {
      ...state,
      reactionWindow: {
        ...state.reactionWindow,
        passedPlayerIds: newPassed,
      },
    };
  }

  private static handleAcknowledgeVoyante(state: GameState, playerId: string): GameState {
    if (state.phase !== GamePhase.VIEWING_VOYANTE) return state;
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return state;

    // Voyante est PEEK : on revient en WAITING_FOR_TURN_ACTION sans avancer le tour
    return {
      ...state,
      voyanteCards: [],
      effectStack: [],
      phase: GamePhase.WAITING_FOR_TURN_ACTION,
    };
  }

  // --- Utility methods ---

  private static openReactionWindow(state: GameState, effect: PendingEffect): GameState {
    // All non-eliminated players except the one who played the card can react
    const eligiblePlayerIds = state.players
      .filter(p => !p.isEliminated && p.id !== effect.sourcePlayerId)
      .map(p => p.id);

    // Check if any eligible player has instant cards
    const anyCanReact = eligiblePlayerIds.some(pid => {
      const player = state.players.find(p => p.id === pid)!;
      return player.hand.some(c =>
        isInstant(c.type) && !state.chainedCards.some(ch => ch.cardType === c.type)
      );
    });

    if (!anyCanReact || eligiblePlayerIds.length === 0) {
      // No one can react, resolve immediately
      return GameEngine.resolveTopEffect({ ...state, reactionWindow: null });
    }

    return {
      ...state,
      phase: GamePhase.REACTION_WINDOW,
      reactionWindow: {
        forEffect: effect,
        eligiblePlayerIds,
        passedPlayerIds: [],
        timeoutMs: 10000,
        startedAt: Date.now(),
      },
    };
  }

  private static resolveTopEffect(state: GameState): GameState {
    if (state.effectStack.length === 0) {
      return GameEngine.advanceTurn(state);
    }

    const topEffect = state.effectStack[state.effectStack.length - 1];
    const handler = getEffectHandler(topEffect.cardType);

    if (!handler) {
      // Unknown card type, just advance
      return GameEngine.advanceTurn({ ...state, effectStack: [] });
    }

    const result = handler(state, topEffect);
    const newState: GameState = {
      ...result.state,
      effectStack: [],
    };

    switch (result.nextPhase) {
      case GamePhase.AWAITING_TARGET:
        return { ...newState, effectStack: result.state.effectStack, phase: GamePhase.AWAITING_TARGET };
      case GamePhase.AWAITING_CARD_CHOICE:
        return { ...newState, effectStack: result.state.effectStack, phase: GamePhase.AWAITING_CARD_CHOICE };
      case GamePhase.VIEWING_VOYANTE:
        return { ...newState, phase: GamePhase.VIEWING_VOYANTE };
      case GamePhase.PLAYER_ELIMINATED:
        return GameEngine.checkElimination(newState);
      default:
        return GameEngine.advanceTurn(newState);
    }
  }

  private static resolveStackOrAdvance(state: GameState): GameState {
    if (state.effectStack.length > 0) {
      // There are still effects on the stack to resolve
      return GameEngine.resolveTopEffect(state);
    }
    return GameEngine.advanceTurn(state);
  }

  private static advanceTurn(state: GameState): GameState {
    // Decrement mustPlayCount
    const remaining = state.mustPlayCount - 1;
    if (remaining > 0) {
      return {
        ...state,
        mustPlayCount: remaining,
        phase: GamePhase.WAITING_FOR_TURN_ACTION,
        effectStack: [],
        reactionWindow: null,
      };
    }

    // Decrement chain counters
    const newChained = state.chainedCards
      .map(c => ({ ...c, turnsRemaining: c.turnsRemaining - 1 }))
      .filter(c => c.turnsRemaining > 0);

    // Move to next non-eliminated player
    let nextIndex = state.currentPlayerIndex;
    const numPlayers = state.players.length;
    do {
      nextIndex = (nextIndex + state.direction + numPlayers) % numPlayers;
    } while (state.players[nextIndex].isEliminated && nextIndex !== state.currentPlayerIndex);

    return {
      ...state,
      currentPlayerIndex: nextIndex,
      turnCount: state.turnCount + 1,
      mustPlayCount: 1,
      phase: GamePhase.WAITING_FOR_TURN_ACTION,
      effectStack: [],
      chainedCards: newChained,
      reactionWindow: null,
      voyanteCards: [],
      eliminatedPlayerId: null,
    };
  }

  private static checkElimination(state: GameState): GameState {
    const alivePlayers = state.players.filter(p => !p.isEliminated);

    if (alivePlayers.length <= 1) {
      return {
        ...state,
        phase: GamePhase.GAME_OVER,
        winner: alivePlayers.length === 1 ? alivePlayers[0].id : null,
        lastEvent: {
          type: 'game_over',
          playerId: alivePlayers[0]?.id,
          message: alivePlayers.length === 1
            ? `${alivePlayers[0].name} a gagné la partie !`
            : 'Match nul !',
        },
      };
    }

    // Handle eliminated player's cards based on config
    const eliminated = state.players.find(p => p.id === state.eliminatedPlayerId);
    let newDrawPile = state.drawPile;
    let newDiscardPile = state.discardPile;
    let newPlayers = state.players;
    if (eliminated && eliminated.hand.length > 0) {
      if (state.config.deadCardsReturnToPile) {
        // Cards go back into draw pile (shuffled)
        newDrawPile = shuffle([...state.drawPile, ...eliminated.hand]);
      } else {
        // Cards go to discard pile
        newDiscardPile = [...state.discardPile, ...eliminated.hand];
      }
      newPlayers = state.players.map(p =>
        p.id === eliminated.id ? { ...p, hand: [] } : p
      );
    }

    const advancedState: GameState = {
      ...state,
      players: newPlayers,
      drawPile: newDrawPile,
      discardPile: newDiscardPile,
    };

    return GameEngine.advanceTurn(advancedState);
  }
}
