import { NameValues, parseOptions } from "@/common/markdownUtil";
import TopicCard from "./types/cards/TopicCard";
import LLMMessages, { duplicateLLMMessages } from "@/llm/types/LLMMessages";
import { addAssistantMessageToChatHistory, addUserMessageToChatHistory } from "@/llm/messageUtil";
import CardType from "./types/cards/CardType";
import KeywordGoal from "./types/cards/KeywordGoal";
import AudienceMember from "./types/AudienceMember";
import HappinessChange from "./types/HappinessChange";
import { generate } from "@/llm/llmUtil";
import { scaleClamped } from "@/common/mathUtil";
import { createGlobalHappinessChangesForAudience, DISLIKE_BUMP, LIKE_BUMP } from "./happinessUtil";

/*
* eval=Player greets a group of people.
* eval0=what am i doing here|huh|it is raining
* eval50=hey i see you|i am speaking to you tonight|look at all the people|i'm glad to be here with you tonight
* eval100=hello everybody|how are you all doing tonight|welcome to you all|i love this place i love you all no cellphones please hello
*/

// Randomly select useCount # of keywords and return corresponding goals for them.
function _createKeywordGoals(keywordGoalsText?:string, useCount:number = 3):KeywordGoal[] {
  if (!keywordGoalsText) return [];
  const keywords = parseOptions(keywordGoalsText);
  const shuffledKeywords = keywords.sort(() => 0.5 - Math.random());
  const selectedKeywords = shuffledKeywords.slice(0, useCount);
  return selectedKeywords.map(keyword => {return {keyword, isComplete:false} });
}

function _addScoringExamples(examples:string[], scoreResponse:string, messages:LLMMessages) {
  examples.forEach(example => {
    addUserMessageToChatHistory(messages, example);
    addAssistantMessageToChatHistory(messages, scoreResponse);
  });
}

function _createLlmInstructions(cardInfo:NameValues):LLMMessages|null {
  const evalText = cardInfo.eval;
  if (!evalText) return null;
  const eval0Examples = cardInfo.eval0 ? parseOptions(cardInfo.eval0) : null;
  const eval50Examples = cardInfo.eval50 ? parseOptions(cardInfo.eval50) : null;
  const eval100Examples = cardInfo.eval100 ? parseOptions(cardInfo.eval100) : null;
  const systemMessage = `You are scoring a game player's message based on their message matching this criteria: ${evalText}.` +
    `Output a single number between 0 (message is unrelated) and 9 (perfect match) and nothing else.`;
  const messages:LLMMessages = {
    maxChatHistorySize:100,
    systemMessage,
    chatHistory:[]
  }
  if (eval0Examples) _addScoringExamples(eval0Examples, '0', messages);
  if (eval50Examples) _addScoringExamples(eval50Examples, '4', messages);
  if (eval100Examples) _addScoringExamples(eval100Examples, '9', messages);
  return messages;
}

export function createTopicCard(cardInfo:NameValues, key:string):TopicCard {
  return {
    key,
    type:CardType.Topic,
    title: cardInfo.title || 'Untitled Topic',
    description: cardInfo.description || '',
    keywordGoals: _createKeywordGoals(cardInfo.keywordGoals),
    isComplete:false,
    llmScoreInstructions: _createLlmInstructions(cardInfo)
   }
}

const ZERO_ASCII_VALUE = '0'.charCodeAt(0);
function _calcHappinessDeltaFromScoreResponse(scoreResponse:string):number {
  if (!scoreResponse.length) return 0; // An LLM glitch. Just treat as neutral score.
  const charValue = scoreResponse.charCodeAt(0) - ZERO_ASCII_VALUE;
  if (charValue < 0 || charValue > 9) return 0; // An LLM glitch.
  return scaleClamped(charValue, 0, 9, DISLIKE_BUMP, LIKE_BUMP);
}

export async function preWarmLlmForTopicCard(card:TopicCard) {
  if (!card.llmScoreInstructions) return;
  const messages = duplicateLLMMessages(card.llmScoreInstructions);
  addUserMessageToChatHistory(messages, 'i');
  await generate(messages); // I don't care about the response - just getting the LLM to load instructions into its KVCache so next call will be fast.
}

export async function findHappinessChangesForTopicCard(cardPlayerTexts:string[], card:TopicCard, audienceMembers:AudienceMember[]):Promise<HappinessChange[]> {
  if (!card.isComplete) return createGlobalHappinessChangesForAudience(DISLIKE_BUMP, audienceMembers);
  if (!card.llmScoreInstructions) return [];
  const messages = duplicateLLMMessages(card.llmScoreInstructions);
  addUserMessageToChatHistory(messages, cardPlayerTexts.join('. '));
  const scoreResponse = await generate(messages);
  const happinessDelta = _calcHappinessDeltaFromScoreResponse(scoreResponse);
  return createGlobalHappinessChangesForAudience(happinessDelta, audienceMembers);
}