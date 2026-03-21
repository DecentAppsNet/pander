import { ItemToken } from "wink-nlp";
import { getNlp } from "./nlpUtil";
import { clamp } from "@/common/mathUtil";

const TARGET_UTTERANCE_LENGTH = 6; // a word count threshold that maybe correlates well with full sentences.
const UTTERANCE_LENGTH_WEIGHT = 3;
const UNIQUE_PARTS_WEIGHT = 1;
const UNIQUE_WORDS_WEIGHT = 1;
const WEIGHT_COUNT = UTTERANCE_LENGTH_WEIGHT + UNIQUE_WORDS_WEIGHT + UNIQUE_PARTS_WEIGHT;
export function calcSpeechCoherence(speech:string):number {
  const nlp = getNlp(), its = nlp.its;
  const doc = nlp.readDoc(speech);

  let wordCount = 0;
  const partsFound:Set<string> = new Set<string>;
  const uniqueWordsFound:Set<string> = new Set<string>;

  doc.tokens().each((t: ItemToken) => {
    const type: string = t.out(its.type);
    if (type !== 'word') return;
    ++wordCount;
    const value:string = t.out(its.value) || '';
    const pos: string = t.out(its.pos) || 'X';
    uniqueWordsFound.add(value);
    partsFound.add(pos);
  });

  if (wordCount === 0) return 1; // handling silence
  const utteranceLengthScore = (clamp(wordCount, 1, TARGET_UTTERANCE_LENGTH) - 1) / (TARGET_UTTERANCE_LENGTH - 1);
  const uniquePartsScore = partsFound.size / wordCount;
  const uniqueWordsScore = uniqueWordsFound.size / wordCount;
  const score = clamp((utteranceLengthScore*UTTERANCE_LENGTH_WEIGHT + uniquePartsScore*UNIQUE_PARTS_WEIGHT + 
      uniqueWordsScore*UNIQUE_WORDS_WEIGHT) / WEIGHT_COUNT, 0, 1);
  console.log(`utteranceLengthScore=${utteranceLengthScore} uniquePartsScore=${uniquePartsScore} uniqueWordsScore=${uniqueWordsScore} score=${score}`);
  return score;
}