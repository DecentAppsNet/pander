import { assertNonNullable } from "decent-portal";
import Card from "./types/cards/Card";
import CardType from "./types/cards/CardType";
import Deck from "./types/cards/Deck";
import KeywordGoal from "./types/cards/KeywordGoal";
import TopicCard from "./types/cards/TopicCard";
import HappinessChange from "./types/HappinessChange";
import { promptToUniqueWords } from "./wordAnalysisUtil";

let theNextKeyNo = 0;

export type DeckChangedCallback = (deck:Deck) => void;
export type UpdateCardChanges = {
  didCardChange:boolean;
  happinessChanges:HappinessChange[];
}

function _nextKey():string {
  return '' + (++theNextKeyNo);
}

function _createKeywordGoals(keywords:string[]):KeywordGoal[] {
  return keywords.map(keyword => {return {keyword, isComplete:false} });
}

// Just use this function to create a deck for now. Wait for the dust to settle before making a clean data-driven approach.
export function createSomeStupidDeck():Deck {
  const cards:Card[] = [
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Early Days',
      description: 'Tell a brief anecdote from your past using the keywords below.',
      keywordGoals: _createKeywordGoals(['when', 'young', 'used'])
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Just Like You',
      description: `Make a connection by telling your audience you're just like them.`,
      keywordGoals: _createKeywordGoals(['both', 'same', 'share'])
    },
  ];
  return { cards, activeCardNo:0 };
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
  return {didCardChange, happinessChanges:[]};
}

const cardTypeToUpdateFunction = {
  [CardType.Topic]: _updateTopicCardFromPrompt,
}
export function updateCardFromPrompt(playerText:string, card:Card):UpdateCardChanges {
  const updateFunction = cardTypeToUpdateFunction[card.type];
  assertNonNullable(updateFunction);
  return updateFunction(playerText, card);
}