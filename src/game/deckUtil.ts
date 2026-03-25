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
      title: 'Simple Greeting',
      description: 'Say hi to the crowd.',
      keywordGoals: _createKeywordGoals(['welcome', 'everyone', 'candidate'])
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Town Pride',
      description: 'Show appreciation for their place on the map.',
      keywordGoals: _createKeywordGoals(['town', 'street', 'barber'])
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Early Days',
      description: 'Tell a brief anecdote from your past.',
      keywordGoals: _createKeywordGoals(['when', 'young', 'fishing'])
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Just Like Them',
      description: `Make em feel you're one of them.`,
      keywordGoals: _createKeywordGoals(['both', 'same', 'share'])
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Scapegoat',
      description: `Pick somebody to blame for the World's problems.`,
      keywordGoals: _createKeywordGoals(['who', 'enemy', 'responsible'])
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Gonna Fix It',
      description: `You've got the solution.`,
      keywordGoals: _createKeywordGoals(['assess', 'plan', 'sleeves'])
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Time to Rhyme',
      description: `Everybody likes some good rhymin'`,
      keywordGoals: _createKeywordGoals(['frustration', 'stagnation', 'nation'])
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Final Call',
      description: `Wrap up the speech and remind them to vote.`,
      keywordGoals: _createKeywordGoals(['grateful', 'time', 'vote'])
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