import TopicCard from "@/game/types/cards/TopicCard";
import CardView from "./CardView";
import KeywordGoal from "@/game/types/cards/KeywordGoal";
import styles from './CardView.module.css';

type Props = {
  card:TopicCard
}

function _renderKeywordGoals(keywordGoals:KeywordGoal[]) {
  return <div className={styles.keywordGoals}>
    {keywordGoals.map(kg => 
      <span className={kg.isComplete ? styles.completedKeywordGoal : styles.incompleteKeywordGoal }>{kg.keyword}</span>
    )}
  </div>
}

function TopicCardView({card}:Props) {
  const keywordsContent = _renderKeywordGoals(card.keywordGoals);
  return (
    <CardView card={card}>
      {keywordsContent}
    </CardView>)
}

export default TopicCardView;