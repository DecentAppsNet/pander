import { setHappiness } from "@/components/audienceView/audienceEventUtil";
import { DeckChangedCallback } from "@/game/deckUtil";
import GameSession from "@/game/GameSession";
import { AverageHappinessChangeCallback, EndLevelCallback } from "@/game/happinessUtil";
import { getDefaultLevelId } from "@/game/levelFileUtil";
import { appendRecentPrompt } from "@/persistence/recentPrompts";
import { assertNonNullable } from "decent-portal";

let theOnSetRecentPrompts:Function|null = null;
let theGameSession:GameSession|null = null;
let theLastMessageIncoherent:boolean = false;

export const DEFAULT_TURN_DURATION = 30000;

export async function initGame(onSetRecentPrompts:Function, setAverageHappiness:AverageHappinessChangeCallback, 
    onDeckChanged:DeckChangedCallback, onEndLevel:EndLevelCallback):Promise<string> {
  theOnSetRecentPrompts = onSetRecentPrompts;
  function _setHappiness(characterId:string, triggerWord:string, happiness:number) {
    if (!theLastMessageIncoherent) setHappiness(characterId, triggerWord, happiness);
  }
  theGameSession = new GameSession(_setHappiness, setAverageHappiness, onDeckChanged, onEndLevel);
  const levelId = await getDefaultLevelId();
  return levelId;
}

export async function promptFromChatInput(playerText:string) {
  const recentPrompts = await appendRecentPrompt(playerText);
  if (theOnSetRecentPrompts) theOnSetRecentPrompts(recentPrompts);
  if (theGameSession) {
    await theGameSession.prompt(playerText);
    await theGameSession.onStopTalking(playerText);
  }
}

export async function promptFromSpeech(playerText:string) {
  if (theGameSession) theGameSession.prompt(playerText);
}

export async function onStopTalking(playerText:string) {
  if (theGameSession) await theGameSession.onStopTalking(playerText);
}

export async function startLevel(levelId:string, setAudienceMembers:Function) {
  assertNonNullable(theGameSession);
  const level = await theGameSession.startLevel(levelId);
  setAudienceMembers(level.audienceMembers);
}