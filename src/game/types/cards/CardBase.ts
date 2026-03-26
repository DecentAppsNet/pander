import CardType from "./CardType";

type CardBase = {
  key: string;
  type: CardType;
  title: string;
  description: string;
  isComplete: boolean;
}

export function duplicateCardBase(from:CardBase):CardBase {
  return { ...from };
}

export default CardBase;