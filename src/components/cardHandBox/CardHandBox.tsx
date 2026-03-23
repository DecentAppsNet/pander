import { ReactNode } from 'react';

import Card from '@/game/types/cards/Card';
import styles from './CardHandBox.module.css';
import CardType from '@/game/types/cards/CardType';
import TopicCardView from './TopicCardView';
import TopicCard from '@/game/types/cards/TopicCard';
import Deck from '@/game/types/cards/Deck';

// Adapted from Peter's https://github.com/Syntax753/pander/blob/carder/src/components/chat/CardHandBox.tsx

type Props = {
  deck: Deck | null;
}

function _cardViewContent(card: Card): ReactNode {
  switch (card.type) {
    case CardType.Topic: return <TopicCardView key={card.key} card={card as TopicCard} />
    default: throw Error(`Don't know how to render card type - ${card.type}.`);
  }
}

function _getDeckCountText(count: number): string {
  if (count === 0) return 'Last card!';
  if (count === 1) return '1 card left';
  return `${count} cards left`;
}

function CardHandBox({ deck }: Props) {
  if (!deck) return null;
  const remainingCardCount = deck.cards.length - deck.activeCardNo - 1;
  const activeCard = deck.cards[deck.activeCardNo];
  const deckCountText = _getDeckCountText(remainingCardCount);
  return (
    <div className={styles.container}>
      <div className={styles.hand}>
        {_cardViewContent(activeCard)}
      </div>
      <div className={styles.deckInfo}>
        <div className={styles.deckCount}>
          {deckCountText}
        </div>
      </div>
    </div>
  );
}

export default CardHandBox;