type BattleMessageType =
  | 'TURN_START'
  | 'PROMPT'
  | 'CARD_UPDATE'
  | 'SCORE_UPDATE'
  | 'TURN_END'
  | 'GAME_END';

type BattleMessage = {
  type: BattleMessageType;
  payload: any;
  timestamp: number;
};

export type { BattleMessageType };
export default BattleMessage;
