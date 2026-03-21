import { ItemToken } from "wink-nlp";
import { getNlp } from "./nlpUtil";

const MAX_SPEECH_HISTORY = 3;

type PartOfSpeechStats = { noun:number, verb:number, adj:number, adv:number, prep:number, pronoun:number };

const EXPECTED_POS_RATIOS:PartOfSpeechStats = { noun: 0.28, verb: 0.18, adj: 0.08, adv: 0.06, prep: 0.22, pronoun: 0.18 };

function _getPartOfSpeechRatios(posCounts:PartOfSpeechStats, wordCount:number):PartOfSpeechStats {
  return {
    noun: posCounts.noun / wordCount,
    verb: posCounts.verb / wordCount,
    adj: posCounts.adj / wordCount,
    adv: posCounts.adv / wordCount,
    prep: posCounts.prep / wordCount,
    pronoun: posCounts.pronoun / wordCount
  };
}

// Return a distance score from 0 to 1 representing how closely two sets of ratios match. Each input ratio will be a value from 0 to 1.
function _comparePartOfSpeechRatios(a:PartOfSpeechStats, b:PartOfSpeechStats):number {
  const nounDiff = Math.abs(a.noun - b.noun);
  const verbDiff = Math.abs(a.verb - b.verb);
  const adjDiff = Math.abs(a.adj - b.adj);
  const advDiff = Math.abs(a.adv - b.adv);
  const prepDiff = Math.abs(a.prep - b.prep);
  const pronounDiff = Math.abs(a.pronoun - b.pronoun);
  const totalDiff = nounDiff + verbDiff + adjDiff + advDiff + prepDiff + pronounDiff;
  const maxTotalDiff = 6; // if all ratios were completely different (e.g. all nouns vs all verbs).
  return 1 - (totalDiff / maxTotalDiff);
}

/* Receives unpunctuated speech transcript. Returns a "coherence" score from 0 to 1 representing 
   how closely words in the speech follow expected ratios of part-of-speech words in casual spoken English. */
function _calcCoherence(speech:string):number {
  const nlp = getNlp(), its = nlp.its;
  const doc = nlp.readDoc(speech);

  const posCounts:PartOfSpeechStats = { noun: 0, verb: 0, adj: 0, adv: 0, prep: 0, pronoun: 0 };
  let wordCount = 0;

  doc.tokens().each((t: ItemToken) => {
    const type: string = t.out(its.type);
    if (type !== 'word') return;
    ++wordCount;
    const value:string = t.out(its.value) || '';
    const pos: string = t.out(its.pos) || 'X';
    console.log(`${value}=${pos}`);
    
    if (pos === 'NOUN' || pos === 'PROPN') posCounts.noun++;
    else if (pos === 'VERB' || pos === 'AUX') posCounts.verb++;
    else if (pos === 'ADJ') posCounts.adj++;
    else if (pos === 'ADV') posCounts.adv++;
    else if (pos === 'ADP') posCounts.prep++;
    else if (pos === 'PRON') posCounts.pronoun++;
  });
  if (wordCount === 0) return 1; // Silence is always coherent.

  // Get ratios.
  const posRatios = _getPartOfSpeechRatios(posCounts, wordCount);

  // Compare to expected ratios and return a coherence score.
  return _comparePartOfSpeechRatios(posRatios, EXPECTED_POS_RATIOS);
}

class CoherenceEvaluator {
  private _speechHistory:string[] = [];

  reset() {
    this._speechHistory = [];
  }

  calcSpeechCoherence(speech:string):number {
    if (this._speechHistory.length === MAX_SPEECH_HISTORY) this._speechHistory.shift();
    this._speechHistory.push(speech);
    const combinedSpeech = this._speechHistory.join(' ');
    return _calcCoherence(combinedSpeech);
  }

}

export default CoherenceEvaluator;