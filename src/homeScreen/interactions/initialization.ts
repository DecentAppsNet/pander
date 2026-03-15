import { loadCharacterSpriteset } from "@/components/audienceView/characterSpriteUtil";
import { getRecentPrompts } from "@/persistence/recentPrompts";
import { isEmbeddingLoaded } from "@/transformersJs/embeddingUtil";
import { initGame } from "./game";
import CharacterSpriteset from "@/components/audienceView/types/CharacterSpriteset";

export type InitResults = {
  characterSpriteset:CharacterSpriteset,
  levelId:string
}

export async function init(setRecentPrompts:Function):Promise<InitResults|null> {
  if (!isEmbeddingLoaded()) return null;

  // It's going to double-load in dev environment, and that's harmless. If you decide to add a flag check, you also
  // need to do something like have 3 potential return states, e.g., failed-try-again-after-llm-load, failed-dont-try-again, success.
  const characterSpriteset = await loadCharacterSpriteset('/characters/characters.md');
  const recentPrompts = await getRecentPrompts();
  const levelId = await initGame(setRecentPrompts);
  setRecentPrompts(recentPrompts);
  return { characterSpriteset, levelId };
}