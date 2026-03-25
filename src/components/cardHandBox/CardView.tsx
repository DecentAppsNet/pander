import type { ReactNode } from 'react';

import Card from '@/game/types/cards/Card';
import styles from './CardView.module.css';
import TurnTimer from './TurnTimer';

type Props = {
  card: Card,
  children?: ReactNode,
  isPreview?: boolean
}

function CardView({ card, children, isPreview }: Props) {
  const cardClass = isPreview ? styles.cardPreview : styles.card;
  const turnTimerContent = isPreview ? null : <TurnTimer duration={30000} />;
  const descriptionContent =  <p className={styles.cardDescription}>{card.description}</p>;
  return (
    <div className={cardClass}>
      <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{card.title}</span>
      </div>
      {descriptionContent}
      {turnTimerContent}
      <div className={styles.cardInterior}>{children}</div>
    </div>
  )
}

export default CardView;