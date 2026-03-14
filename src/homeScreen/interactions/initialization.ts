import { loadCharacterSpriteset } from "@/components/audienceView/characterSpriteUtil";
import { getRecentPrompts } from "@/persistence/recentPrompts";
import { isEmbeddingLoaded } from "@/transformersJs/embeddingUtil";
import { initGame } from "./game";

export async function init(setCharacterSpriteset:Function, setRecentPrompts:Function):Promise<boolean> {
  if (!isEmbeddingLoaded()) return false;

  // It's going to double-load in dev environment, and that's harmless. If you decide to add a flag check, you also
  // need to do something like have 3 potential return states, e.g., failed-try-again-after-llm-load, failed-dont-try-again, success.
  const characterSpriteset = await loadCharacterSpriteset('/characters/characters.md');
  setCharacterSpriteset(characterSpriteset);
  const recentPrompts = await getRecentPrompts();
  setRecentPrompts(recentPrompts);
  await initGame(setRecentPrompts);

  return true;
}