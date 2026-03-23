import CardBase, { duplicateCardBase } from "./CardBase"
import CardType from "./CardType"
import KeywordGoal from "./KeywordGoal";

type TopicCard = CardBase & {
  type: CardType.Topic,
  keywordGoals: KeywordGoal[]
}

export function duplicateTopicCard(from:TopicCard):TopicCard {
  return {
    ...duplicateCardBase(from),
    keywordGoals: from.keywordGoals.map(kg => ({ ...kg }))
  };
}

export default TopicCard;