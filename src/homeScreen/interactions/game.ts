import { setHappiness } from "@/components/audienceView/audienceEventUtil";
import { DeckChangedCallback } from "@/game/deckUtil";
import GameSession from "@/game/GameSession";
import { AverageHappinessChangeCallback, EndLevelCallback } from "@/game/happinessUtil";
import { getDefaultLevelId } from "@/game/levelFileUtil";
import GameSessionSettings from "@/game/types/GameSettings";
import { appendRecentPrompt } from "@/persistence/recentPrompts";
import { assertNonNullable } from "decent-portal";
import { infoToast } from "@/components/toasts/toastUtil";

let theOnSetRecentPrompts:Function|null = null;
let theGameSession:GameSession|null = null;
let theLastMessageIncoherent:boolean = false;

export const DEFAULT_TURN_DURATION = 30000;

export async function initGame(onSetRecentPrompts:Function, setAverageHappiness:AverageHappinessChangeCallback, 
    onDeckChanged:DeckChangedCallback, onEndLevel:EndLevelCallback):Promise<string> {
  theOnSetRecentPrompts = onSetRecentPrompts;
  function _setHappiness(characterId:string, happiness:number) {
    if (!theLastMessageIncoherent) setHappiness(characterId, happiness);
  }
  const gameSessionSettings:GameSessionSettings = { turnDuration:DEFAULT_TURN_DURATION };
  theGameSession = new GameSession(gameSessionSettings, _setHappiness, setAverageHappiness, onDeckChanged, onEndLevel);
  const levelId = await getDefaultLevelId();
  return levelId;
}

export async function promptFromChatInput(playerText:string) {
  const recentPrompts = await appendRecentPrompt(playerText);
  if (theOnSetRecentPrompts) theOnSetRecentPrompts(recentPrompts);
  if (theGameSession) {
    await theGameSession.prompt(playerText);
    await theGameSession.onStopTalking();
  }
}

export async function promptFromSpeech(playerText:string) {
  if (theGameSession) theGameSession.prompt(playerText);
}

export async function onStopTalking() {
  if (theGameSession) await theGameSession.onStopTalking();
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
    if (theGameSession) theGameSession.penalizeScore();
  } else if (wasAudienceConfused) {
    infoToast('Audience is no longer confused.');
  }
}