import { clamp } from "@/common/mathUtil";
import WordUsageHistory from "./types/WordUsageHistory";

export type WordCooldownFactorCallback = (word:string) => number;

export function updateWordUsageHistory(playerText:string, wordUsageHistory:WordUsageHistory, now:number = performance.now()) {
  const words = playerText.split(' ').map(t => t.trim().toLowerCase());
  words.forEach(word => wordUsageHistory[word] = now);
}

const COOLDOWN_ZERO_DURATION = 3000; // Word has no impact at all for an initial period of time.
const COOLDOWN_SCALE_DURATION = 10000; // And after that, it gradually scales up in impact from 0% to 100%.
export function findWordCooldownFactor(word:string, wordUsageHistory:WordUsageHistory, now:number = performance.now()):number {
  const lastSaidTime = wordUsageHistory[word];
  if (lastSaidTime === undefined) return 1;
  let elapsed = now - lastSaidTime;
  if (elapsed < COOLDOWN_ZERO_DURATION) return 0;
  elapsed -= COOLDOWN_ZERO_DURATION;
  return clamp(elapsed / COOLDOWN_SCALE_DURATION, 0, 1);
}