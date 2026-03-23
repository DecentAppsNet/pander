import TopicCard from "@/game/types/cards/TopicCard";
import CardView from "./CardView";
import KeywordGoal from "@/game/types/cards/KeywordGoal";
import styles from './CardView.module.css';

type Props = {
  card:TopicCard,
  isPreview?:boolean
}

function _renderKeywordGoals(keywordGoals:KeywordGoal[]) {
  return <div className={styles.keywordGoals}>
    {keywordGoals.map(kg => 
      <span className={kg.isComplete ? styles.completedKeywordGoal : styles.incompleteKeywordGoal }>{kg.keyword}</span>
    )}
  </div>
}

function TopicCardView({card, isPreview}:Props) {
  const keywordsContent = isPreview ? null : _renderKeywordGoals(card.keywordGoals);
  return (
    <CardView card={card} isPreview={isPreview}>
      {keywordsContent}
    </CardView>)
}

export default TopicCardView;