import { setHappiness } from "@/components/audienceView/audienceEventUtil";
import GameSession from "@/game/GameSession";
import { getDefaultLevelId } from "@/game/levelFileUtil";
import { appendRecentPrompt } from "@/persistence/recentPrompts";
import { assertNonNullable } from "decent-portal";

let theOnSetRecentPrompts:Function|null = null;
let theGameSession:GameSession|null = null;

export async function initGame(onSetRecentPrompts:Function):Promise<string> {
  theOnSetRecentPrompts = onSetRecentPrompts;
  theGameSession = new GameSession(setHappiness);
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