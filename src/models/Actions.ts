export type PlayerAction =
  | { type: 'DRAW_CARD'; playerId: string }
  | { type: 'DRAW_CARD_SKIP_ANGE'; playerId: string }
  | { type: 'PLAY_CARD'; playerId: string; cardInstanceId: string }
  | { type: 'CHOOSE_TARGET'; playerId: string; targetPlayerId: string }
  | { type: 'CHOOSE_CARD_TO_GIVE'; playerId: string; cardInstanceId: string }
  | { type: 'REACT_WITH_CARD'; playerId: string; cardInstanceId: string }
  | { type: 'PASS_REACTION'; playerId: string }
  | { type: 'ACKNOWLEDGE_VOYANTE'; playerId: string };
