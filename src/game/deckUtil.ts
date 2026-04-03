import { assertNonNullable } from "decent-portal";
import Card from "./types/cards/Card";
import CardType from "./types/cards/CardType";
import Deck from "./types/cards/Deck";
import TopicCard from "./types/cards/TopicCard";
import HappinessChange from "./types/HappinessChange";
import { promptToUniqueWords } from "./wordAnalysisUtil";
import Level from "./types/Level";
import { findCardInfo } from "./cardsFileUtil";
import { createTopicCard, findHappinessChangesForTopicCard, preWarmLlmForTopicCard } from "./topicCardUtil";
import AudienceMember from "./types/AudienceMember";

let theNextKeyNo = 0;

export type DeckChangedCallback = (deck:Deck) => void;
export type UpdateCardChanges = {
  didCardChange:boolean;
  happinessChanges:HappinessChange[];
}

function _nextKey():string {
  return '' + (++theNextKeyNo);
}

function _createEmptyDeck():Deck {
  return { cards:[], activeCardNo:0 };
}

async function _createCard(cardId:string):Promise<Card|null> {
  try {
    const cardInfo = await findCardInfo(cardId);
    if (cardInfo.type === 'Topic') return createTopicCard(cardInfo, _nextKey());
    console.warn(`Don't know how to create card of type "${cardInfo.type}". Skipping!`);
    return null;
  } catch(e) {
    console.warn(`Failed to create card ID "${cardId}". Error: ` + e);
    return null;
  }
}

export async function createDeckForLevel(level:Level):Promise<Deck> {
  if (level.cardIds.length === 0) return _createEmptyDeck();
  const deck:Deck = { cards:[], activeCardNo:0 };
  for(let i = 0; i < level.cardIds.length; ++i) {
    const card = await _createCard(level.cardIds[i]);
    if (card) deck.cards.push(card);
  }
  return deck;
}


function _updateTopicCardFromPrompt(playerText:string, card:TopicCard):UpdateCardChanges {
  const words = promptToUniqueWords(playerText);
  let didCardChange = false;
  for(let i = 0; i < card.keywordGoals.length; ++i) {
    const kg = card.keywordGoals[i];
    if (kg.isComplete) continue;
    if (words.includes(kg.keyword)) {
      didCardChange = true;
      kg.isComplete = true;
    }
  }
  if (didCardChange && card.keywordGoals.every(kg => kg.isComplete)) card.isComplete = true;
  return {didCardChange, happinessChanges:[]};
}

const cardTypeToUpdateFunction = {
  [CardType.Topic]: _updateTopicCardFromPrompt,
}
export function updateCardFromPrompt(playerText:string, card:Card):UpdateCardChanges {
  assertNonNullable(card);
  const updateFunction = cardTypeToUpdateFunction[card.type];
  assertNonNullable(updateFunction);
  return updateFunction(playerText, card);
}

export function isEndOfDeck(deck:Deck):boolean {
  assertNonNullable(deck);
  return deck.activeCardNo === deck.cards.length;
}

export function isActiveCardComplete(deck:Deck):boolean {
  assertNonNullable(deck);
  return deck.activeCardNo < deck.cards.length && deck.cards[deck.activeCardNo].isComplete;
}

export function getActiveCard(deck:Deck):Card|null {
  assertNonNullable(deck);
  return deck.activeCardNo >= deck.cards.length ? null : deck.cards[deck.activeCardNo];
}

export function getNextCard(deck:Deck):Card|null {
  assertNonNullable(deck);
  return (deck.activeCardNo >= deck.cards.length - 1)? null : deck.cards[deck.activeCardNo + 1];
}

export async function findHappinessChangesForCard(cardPlayerTexts:string[], card:Card, audienceMembers:AudienceMember[]):Promise<HappinessChange[]> {
  if (card.type === CardType.Topic) return findHappinessChangesForTopicCard(cardPlayerTexts, card, audienceMembers);
  throw new Error('Unexpected');
}

export async function preWarmLlmForCard(card:Card) {
  if (card.type === CardType.Topic) return preWarmLlmForTopicCard(card);
  throw new Error('Unexpected');
}