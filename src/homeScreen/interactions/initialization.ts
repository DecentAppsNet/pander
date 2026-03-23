import { loadCharacterSpriteset } from "@/components/audienceView/characterSpriteUtil";
import { getRecentPrompts } from "@/persistence/recentPrompts";
import { isEmbedderInitialized } from "@/transformersJs/transformersEmbedder";
import { initGame } from "./game";
import CharacterSpriteset from "@/components/audienceView/types/CharacterSpriteset";
import { AverageHappinessChangeCallback } from "@/game/happinessUtil";
import { DeckChangedCallback } from "@/game/deckUtil";

export type InitResults = {
  characterSpriteset:CharacterSpriteset,
  levelId:string
}

export async function init(setRecentPrompts:Function, setAverageHappiness:AverageHappinessChangeCallback, setDeck:DeckChangedCallback):Promise<InitResults|null> {
  if (!isEmbedderInitialized()) return null;

  // It's going to double-load in dev environment, and that's harmless. If you decide to add a flag check, you also
  // need to do something like have 3 potential return states, e.g., failed-try-again-after-llm-load, failed-dont-try-again, success.
  const characterSpriteset = await loadCharacterSpriteset(); // One spriteset containing all characters, regardless of current level.
  const recentPrompts = await getRecentPrompts();
  const levelId = await initGame(setRecentPrompts, setAverageHappiness, setDeck);
  setRecentPrompts(recentPrompts);
  return { characterSpriteset, levelId };
}