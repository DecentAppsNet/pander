import Card from "./types/cards/Card";
import { doesRhyme } from "./rhymeUtil";
import { promptToUniqueWords } from "./wordAnalysisUtil";

const KEYWORD_POINTS = 10;

export type TurnScore = {
  keywordPoints: number;
  rhymeLengthBonus: number;
  crowdMultiplier: number;
  totalScore: number;
};

export function calcTurnScore(card: Card, averageHappiness: number, playerTexts: string[]): TurnScore {
  let keywordPoints = 0;
  let rhymeLengthBonus = 0;

  const allWords: string[] = [];
  for (const text of playerTexts) {
    allWords.push(...promptToUniqueWords(text));
  }

  for (const kg of card.keywordGoals) {
    if (!kg.isComplete) continue;
    keywordPoints += KEYWORD_POINTS;

    // Find the word that matched this keyword for rhyme length bonus
    for (const word of allWords) {
      if (word === kg.keyword) break; // Exact match, no rhyme bonus
      if (doesRhyme(word, kg.keyword)) {
        const bonus = Math.max(0, word.length - kg.keyword.length);
        rhymeLengthBonus += bonus;
        break;
      }
    }
  }

  const crowdMultiplier = averageHappiness * 2; // 0x to 2x
  const totalScore = Math.round((keywordPoints + rhymeLengthBonus) * crowdMultiplier);

  return { keywordPoints, rhymeLengthBonus, crowdMultiplier, totalScore };
}
