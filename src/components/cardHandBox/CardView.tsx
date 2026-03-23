import type { ReactNode } from 'react';

import Card from '@/game/types/cards/Card';
import styles from './CardView.module.css';

type Props = {
  card: Card,
  children?: ReactNode
}

function CardView({ card, children }: Props) {
  return (
    <div className={`${styles.card}`}>
      <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{card.title}</span>
      </div>
      <p className={styles.cardDescription}>{card.description}</p>
      <div className={styles.cardInterior}>{children}</div>
    </div>
  )
}

export default CardView;