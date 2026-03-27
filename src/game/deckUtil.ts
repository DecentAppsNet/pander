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

// Randomly select useCount # of keywords and return corresponding goals for them.
function _createKeywordGoals(keywords:string[], useCount:number = 3):KeywordGoal[] {
  const shuffledKeywords = keywords.sort(() => 0.5 - Math.random());
  const selectedKeywords = shuffledKeywords.slice(0, useCount);
  return selectedKeywords.map(keyword => {return {keyword, isComplete:false} });
}

// Just use this function to create a deck for now. Wait for the dust to settle before making a clean data-driven approach.
export function createSomeStupidDeck():Deck {
  const cards:Card[] = [
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Simple Greeting',
      description: 'Say hi to the crowd.',
      keywordGoals: _createKeywordGoals(['everyone', 'candidate', 'today', 'gathering', 'pleasure', 'crowd', 'honor']),
      isComplete:false
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Town Pride',
      description: 'Show appreciation for their place on the map.',
      keywordGoals: _createKeywordGoals(['town', 'street', 'barber', 'diner', 'school', 'church', 'history', 'pride', 'century']),
      isComplete:false
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Early Days',
      description: 'Tell a brief anecdote from your past.',
      keywordGoals: _createKeywordGoals(['father', 'grandmother', 'fishing', 'struggle', 'birthday', 'first', 'job', 'life', 'lesson', 'bootstraps']),
      isComplete:false
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Just Like Them',
      description: `Make em feel you're one of them.`,
      keywordGoals: _createKeywordGoals(['both', 'same', 'share', 'common', 'understanding', 'relate', 'empathy', 'similar', 'together']),
      isComplete:false
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Scapegoat',
      description: `Pick somebody to blame for the World's problems.`,
      keywordGoals: _createKeywordGoals(['who', 'enemy', 'responsible', 'blame', 'problem', 'trouble', 'stink', 'corruption', 'greed', 'evil']),
      isComplete:false
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Gonna Fix It',
      description: `You've got the solution.`,
      keywordGoals: _createKeywordGoals(['assess', 'plan', 'sleeves', 'work', 'fix', 'solve', 'problem', 'solution', 'ready']),
      isComplete:false
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Time to Rhyme',
      description: `Everybody likes some good rhymin'`,
      keywordGoals: _createKeywordGoals(['frustration', 'stagnation', 'nation', 'innovation', 'education', 'imagination', 
        'dedication', 'motivation', 'inspiration', 'subjugation', 'defecation']),
      isComplete:false
    },
    { 
      key: _nextKey(),
      type:CardType.Topic, 
      title: 'Final Call',
      description: `Wrap up the speech and remind them to vote.`,
      keywordGoals: _createKeywordGoals(['grateful', 'time', 'vote', 'goodbye', 'thank', 'appreciate', 'support', 'win', 'future', 'together']),
      isComplete:false
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