import { setHappiness } from "@/components/audienceView/audienceEventUtil";
import { DeckChangedCallback } from "@/game/deckUtil";
import GameSession from "@/game/GameSession";
import { AverageHappinessChangeCallback } from "@/game/happinessUtil";
import { getDefaultLevelId } from "@/game/levelFileUtil";
import { appendRecentPrompt } from "@/persistence/recentPrompts";
import { assertNonNullable, infoToast } from "decent-portal";

let theOnSetRecentPrompts:Function|null = null;
let theGameSession:GameSession|null = null;
let theLastMessageIncoherent:boolean = false;

export async function initGame(onSetRecentPrompts:Function, setAverageHappiness:AverageHappinessChangeCallback, 
    onDeckChanged:DeckChangedCallback):Promise<string> {
  theOnSetRecentPrompts = onSetRecentPrompts;
  function _setHappiness(characterId:string, happiness:number) {
    if (!theLastMessageIncoherent) setHappiness(characterId, happiness);
  }
  theGameSession = new GameSession(_setHappiness, setAverageHappiness, onDeckChanged);
  const levelId = await getDefaultLevelId();
  return levelId;
}

export async function promptFromChatInput(playerText:string) {
  const recentPrompts = await appendRecentPrompt(playerText);
  if (theOnSetRecentPrompts) theOnSetRecentPrompts(recentPrompts);
  if (theGameSession) theGameSession.prompt(playerText);
}

export async function promptFromSpeech(playerText:string) {
  if (theGameSession) theGameSession.prompt(playerText);
}

export async function startLevel(levelId:string, setAudienceMembers:Function) {
  assertNonNullable(theGameSession);
  const level = await theGameSession.startLevel(levelId);
  setAudienceMembers(level.audienceMembers);
}

const COHERENCE_THRESHOLD = .6;
export function onUpdateCoherence(coherence:number) {
  const wasAudienceConfused = theLastMessageIncoherent;
  theLastMessageIncoherent = coherence < COHERENCE_THRESHOLD;
  if (theLastMessageIncoherent) {
    infoToast('Audience is confused. Speak in full sentences.');
  } else if (wasAudienceConfused) {
    infoToast('Audience is no longer confused.');
  }
}