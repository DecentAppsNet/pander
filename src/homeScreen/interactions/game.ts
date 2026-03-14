import { appendRecentPrompt } from "@/persistence/recentPrompts";

let theOnSetRecentPrompts:Function|null = null;

export async function initGame(onSetRecentPrompts:Function) {
  theOnSetRecentPrompts = onSetRecentPrompts;
}

export async function promptFromChatInput(playerText:string) {
  const recentPrompts = await appendRecentPrompt(playerText);
  if (theOnSetRecentPrompts) theOnSetRecentPrompts(recentPrompts);
  // TODO send to game session.
}