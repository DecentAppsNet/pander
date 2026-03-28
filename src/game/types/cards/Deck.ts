import Card, { duplicateCard } from "./Card";

type Deck = {
  cards:Card[];
  activeCardNo:number;
  score:number;
}

export function duplicateDeck(from:Deck):Deck {
  return {
    cards: from.cards.map(duplicateCard),
    activeCardNo: from.activeCardNo,
    score: from.score
  }
}

export default Deck;