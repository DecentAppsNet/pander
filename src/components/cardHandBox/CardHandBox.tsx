import { ReactNode, useEffect, useRef, useState } from 'react';

import Card from '@/game/types/cards/Card';
import styles from './CardHandBox.module.css';
import CardType from '@/game/types/cards/CardType';
import TopicCardView from './TopicCardView';
import TopicCard from '@/game/types/cards/TopicCard';
import Deck from '@/game/types/cards/Deck';

// Adapted from Peter's https://github.com/Syntax753/pander/blob/carder/src/components/chat/CardHandBox.tsx

const CHANGE_ACTIVE_CARD_DURATION = 200; // Must match CSS animations in CardHandBox.module.css.

type Props = {
  deck: Deck | null;
}

function _cardViewContent(card:Card, isPreview:boolean): ReactNode {
  switch (card.type) {
    case CardType.Topic: return <TopicCardView key={card.key} card={card as TopicCard} isPreview={isPreview}/>
    default: throw Error(`Don't know how to render card type - ${card.type}.`);
  }
}

function _getDeckCountText(count: number): string {
  if (count === 0) return 'Last card!';
  if (count === 1) return '1 card left';
  return `${count} cards left`;
}

function CardHandBox({ deck }: Props) {
  const [isActiveCardChanging, setIsActiveCardChanging] = useState<boolean>(false);
  const [currentDeck, setCurrentDeck] = useState<Deck|null>(deck); // This is used for rendering. 

  useEffect(() => {
    // Animations are implied by changes to the deck. The deckRef is only set to match deck after animations complete.
    if (deck === null) return;
    if (currentDeck?.activeCardNo === deck.activeCardNo - 1) { // Changing to next card.
      setIsActiveCardChanging(true);
      setTimeout(() => {
        setCurrentDeck(deck);
        setIsActiveCardChanging(false);
      }, CHANGE_ACTIVE_CARD_DURATION);
      return;
    }
    setCurrentDeck(deck);
  }, [deck]);
  
  if (!currentDeck) return null;
  const remainingCardCount = currentDeck.cards.length - currentDeck.activeCardNo - 1;
  
  const activeCardClasses = isActiveCardChanging ? `${styles.activeWrapper} ${styles.shrinkToNothing}` : styles.activeWrapper;
  const previewCardClasses = isActiveCardChanging ? `${styles.previewWrapper} ${styles.moveToCenter}` : styles.previewWrapper;
  const nextLabelClasses = isActiveCardChanging || remainingCardCount === 0 ? styles.hidden : styles.nextLabel;

  const activeCard = currentDeck.cards[currentDeck.activeCardNo];
  const previewCardContent = remainingCardCount ? (
    <div className={previewCardClasses} aria-hidden>
      <div className={nextLabelClasses}>next</div>
      {_cardViewContent(currentDeck.cards[currentDeck.activeCardNo+1], true)}
    </div>
  ) : null;
  const deckCountText = _getDeckCountText(remainingCardCount);
  return (
    <div className={styles.container}>
      <div className={styles.hand}>
        <div className={styles.centerArea}>
          <div className={activeCardClasses}>
            {_cardViewContent(activeCard, false)}
          </div>
          {previewCardContent}
        </div>
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