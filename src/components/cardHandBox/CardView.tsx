import type { ReactNode } from 'react';

import Card from '@/game/types/cards/Card';
import styles from './CardView.module.css';

type Props = {
  card: Card,
  children?: ReactNode,
  isPreview?: boolean
}

function CardView({ card, children, isPreview }: Props) {
  const cardClass = isPreview ? styles.cardPreview : styles.card;
  const descriptionContent =  <p className={styles.cardDescription}>{card.description}</p>;
  return (
    <div className={cardClass}>
      <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{card.title}</span>
      </div>
      {descriptionContent}
      <div className={styles.cardInterior}>{children}</div>
    </div>
  )
}

export default CardView;