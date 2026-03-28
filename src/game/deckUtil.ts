import { assertNonNullable } from "decent-portal";
import Card from "./types/cards/Card";
import CardType from "./types/cards/CardType";
import Deck from "./types/cards/Deck";
import KeywordGoal from "./types/cards/KeywordGoal";
import TopicCard from "./types/cards/TopicCard";
import HappinessChange from "./types/HappinessChange";
import TellaStyle from "./types/TellaStyle";
import { doesRhyme } from "./rhymeUtil";
import { promptToUniqueWords } from "./wordAnalysisUtil";

let theNextKeyNo = 0;
let _activeTellaStyle:TellaStyle = TellaStyle.Speech;

export type DeckChangedCallback = (deck:Deck) => void;
export type UpdateCardChanges = {
  didCardChange:boolean;
  happinessChanges:HappinessChange[];
  scoreEarned:number;
}

function _nextKey():string {
  return '' + (++theNextKeyNo);
}

// Randomly select useCount # of keywords, ensuring none of them rhyme with each other.
function _createKeywordGoals(keywords:string[], useCount:number = 3):KeywordGoal[] {
  const shuffledKeywords = keywords.sort(() => 0.5 - Math.random());
  const selected:string[] = [];
  for (const kw of shuffledKeywords) {
    if (selected.length >= useCount) break;
    if (!selected.some(s => doesRhyme(kw, s))) {
      selected.push(kw);
    }
  }
  return selected.map(keyword => {return {keyword, isComplete:false} });
}

function _createSpeechDeck():Deck {
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
  return { cards, activeCardNo:0, score:0 };
}

function _createOGDeck():Deck {
  const cards:Card[] = [
    {
      key: _nextKey(),
      type:CardType.Topic,
      title: 'Rep Your Hood',
      description: 'Shout out where you came from. Rhyme with:',
      keywordGoals: _createKeywordGoals(['block', 'street', 'trap', 'hood', 'ride', 'grill', 'chain', 'town', 'yard', 'turf', 'curb', 'porch']),
      isComplete:false
    },
    {
      key: _nextKey(),
      type:CardType.Topic,
      title: 'Stack That Paper',
      description: 'Spit about gettin paid. Rhyme with:',
      keywordGoals: _createKeywordGoals(['cash', 'bread', 'green', 'bank', 'rich', 'gold', 'stack', 'paid', 'check', 'loot', 'dime', 'mint']),
      isComplete:false
    },
    {
      key: _nextKey(),
      type:CardType.Topic,
      title: 'Ride or Die',
      description: 'Show love for your crew. Rhyme with:',
      keywordGoals: _createKeywordGoals(['crew', 'real', 'tight', 'trust', 'squad', 'bond', 'blood', 'true', 'ride', 'heart', 'back', 'hold']),
      isComplete:false
    },
    {
      key: _nextKey(),
      type:CardType.Topic,
      title: 'Haters Gonna Hate',
      description: 'Call out the fakes and the haters. Rhyme with:',
      keywordGoals: _createKeywordGoals(['fake', 'snitch', 'lame', 'beef', 'sneak', 'talk', 'hate', 'clown', 'fraud', 'shade', 'rat', 'punk']),
      isComplete:false
    },
    {
      key: _nextKey(),
      type:CardType.Topic,
      title: 'From the Bottom',
      description: 'Tell em how you came up from nothing. Rhyme with:',
      keywordGoals: _createKeywordGoals(['grind', 'hustle', 'broke', 'pain', 'fight', 'climb', 'dream', 'dirt', 'sweat', 'hope', 'risk', 'grit']),
      isComplete:false
    },
    {
      key: _nextKey(),
      type:CardType.Topic,
      title: 'Flex on Em',
      description: 'Time to stunt. Rhyme with:',
      keywordGoals: _createKeywordGoals(['ice', 'whip', 'drip', 'clean', 'fresh', 'shine', 'fly', 'crisp', 'gleam', 'slick', 'prime', 'swag']),
      isComplete:false
    },
    {
      key: _nextKey(),
      type:CardType.Topic,
      title: 'Night Life',
      description: 'Paint the scene at the club. Rhyme with:',
      keywordGoals: _createKeywordGoals(['club', 'beat', 'vibe', 'bass', 'dance', 'floor', 'loud', 'drink', 'pulse', 'crowd', 'smoke', 'dark']),
      isComplete:false
    },
    {
      key: _nextKey(),
      type:CardType.Topic,
      title: 'Drop the Mic',
      description: 'Close it out hard. Rhyme with:',
      keywordGoals: _createKeywordGoals(['throne', 'crown', 'king', 'reign', 'top', 'game', 'boss', 'great', 'peak', 'win', 'champ', 'best']),
      isComplete:false
    },
  ];
  return { cards, activeCardNo:0, score:0 };
}

// Just use this function to create a deck for now. Wait for the dust to settle before making a clean data-driven approach.
export function createDeck(tellaStyle:TellaStyle):Deck {
  _activeTellaStyle = tellaStyle;
  return tellaStyle === TellaStyle.OG ? _createOGDeck() : _createSpeechDeck();
}

function _matchesKeyword(word:string, keyword:string):boolean {
  return word === keyword;
}

function _matchesRhyme(word:string, keyword:string):boolean {
  return doesRhyme(word, keyword);
}

function _updateTopicCardFromPrompt(playerText:string, card:TopicCard):UpdateCardChanges {
  const words = promptToUniqueWords(playerText);
  const matchFn = _activeTellaStyle === TellaStyle.OG ? _matchesRhyme : _matchesKeyword;
  let didCardChange = false;
  let scoreEarned = 0;
  for(let i = 0; i < card.keywordGoals.length; ++i) {
    const kg = card.keywordGoals[i];
    if (kg.isComplete) continue;
    const matchingWord = words.find(word => matchFn(word, kg.keyword));
    if (matchingWord) {
      didCardChange = true;
      kg.isComplete = true;
      scoreEarned += matchingWord.length;
    }
  }
  if (didCardChange && card.keywordGoals.every(kg => kg.isComplete)) card.isComplete = true;
  return {didCardChange, happinessChanges:[], scoreEarned};
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