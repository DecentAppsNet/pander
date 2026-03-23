import CardType from "./CardType";
import TopicCard, { duplicateTopicCard } from "./TopicCard";

type Card = TopicCard;

const cardTypeToDuplicateFunc = {
  [CardType.Topic]: duplicateTopicCard
}
export function duplicateCard(from:Card):Card {
  return cardTypeToDuplicateFunc[from.type](from);
}

export default Card;