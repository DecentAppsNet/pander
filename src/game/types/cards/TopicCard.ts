import LLMMessages, { duplicateLLMMessages } from "@/llm/types/LLMMessages";
import CardBase, { duplicateCardBase } from "./CardBase"
import CardType from "./CardType"
import KeywordGoal, { duplicateKeywordGoal } from "./KeywordGoal";

type TopicCard = CardBase & {
  type: CardType.Topic,
  keywordGoals: KeywordGoal[],
  llmScoreInstructions: LLMMessages|null // If null, no LLM scoring will be used for this card.
}

export function duplicateTopicCard(from:TopicCard):TopicCard {
  return {
    ...duplicateCardBase(from),
    keywordGoals: from.keywordGoals.map(duplicateKeywordGoal),
    llmScoreInstructions: from.llmScoreInstructions ? duplicateLLMMessages(from.llmScoreInstructions) : null
  };
}

export default TopicCard;