import { loadCharacterSpriteset } from "@/components/audienceView/characterSpriteUtil";
import { isEmbeddingLoaded } from "@/transformersJs/embeddingUtil";

export async function init(setCharacterSpriteset:Function):Promise<boolean> {
  if (!isEmbeddingLoaded()) return false;

  // It's going to double-load in dev environment, and that's harmless. If you decide to add a flag check, you also
  // need to do something like have 3 potential return states, e.g., failed-try-again-after-llm-load, failed-dont-try-again, success.
  const characterSpriteset = await loadCharacterSpriteset('/characters/characters.md');
  setCharacterSpriteset(characterSpriteset);

  return true;
}