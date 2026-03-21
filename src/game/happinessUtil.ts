import { assertNonNullable } from "decent-portal";

import AudienceMember from "./types/AudienceMember";
import { clamp, isClose } from "@/common/mathUtil";
import HappinessChange from "./types/HappinessChange";
import { WordCooldownFactorCallback } from "./wordAnalysisUtil";

export const DEFAULT_HAPPINESS = .5;
const LOVE_BUMP = .2;
const LIKE_BUMP = .1; 
const DISLIKE_BUMP = -.1;
const HATE_BUMP = -.2;

export type SetHappinessCallback = (characterId:string, happiness:number) => void;
export type FindHappinessChangeCallback = (playerText:string, audienceMember:AudienceMember, onWordCooldownFactor:WordCooldownFactorCallback) => Promise<number>;
export type AverageHappinessChangeCallback = (happiness:number) => void;

function _findAudienceMemberByCharacterId(audienceMembers:AudienceMember[], characterId:string):AudienceMember|null {
  return audienceMembers.find(am => am.characterId === characterId) || null;
}

function _playerTextToWords(playerText:string):string[] {
  const wordSet:Set<string> = new Set<string>();
  const words = playerText.split(' ').map(t => t.trim().toLowerCase());
  words.forEach(word => wordSet.add(word)); // Assign to set to ensure uniqueness.
  return Array.from(wordSet);
}

/* Default function for determining happiness change for one audience member in response to player text. 
   Returns a number representing the amount by which happiness should change. */
export async function findHappinessChangeDefault(playerText:string, audienceMember:AudienceMember, onWordCooldownFactor:WordCooldownFactorCallback):Promise<number> {
  const words = _playerTextToWords(playerText);
  if (!words.length) return 0;
  let delta = 0;
  words.forEach(word => {
    if (audienceMember.loves.includes(word)) delta += (LOVE_BUMP * onWordCooldownFactor(word));
    else if (audienceMember.likes.includes(word)) delta += (LIKE_BUMP * onWordCooldownFactor(word));
    else if (audienceMember.dislikes.includes(word)) delta += (DISLIKE_BUMP * onWordCooldownFactor(word));
    else if (audienceMember.hates.includes(word)) delta += (HATE_BUMP * onWordCooldownFactor(word));
  });
  return delta;
}

/* Looks up a function by name from a "white list" of happiness functions, returning the default happiness function 
   as a fallback if needed. */
export function nameToHappinessFunction(happinessFunctionName:string|null, happinessFunctions:FindHappinessChangeCallback[]):FindHappinessChangeCallback {
  if (!happinessFunctionName) return findHappinessChangeDefault;
  const happinessFunction = happinessFunctions.find(func => func.name === happinessFunctionName);
  if (happinessFunction) return happinessFunction as FindHappinessChangeCallback;
  console.warn(`Could not find happiness function named "${happinessFunctionName}". Using default.`);
  return findHappinessChangeDefault;
}

/* Finds all happiness changes for audience members in response to player text. */
export async function findHappinessChangesForAudience(playerText:string, audienceMembers:AudienceMember[], onFindHappinessChange:FindHappinessChangeCallback, onWordCooldownFactor:WordCooldownFactorCallback):Promise<HappinessChange[]> {
  const changes:HappinessChange[] = [];
  audienceMembers.forEach(async (audienceMember) => {
    const happinessDelta = await onFindHappinessChange(playerText, audienceMember, onWordCooldownFactor);
    if (happinessDelta) changes.push({characterId:audienceMember.characterId, happinessDelta});
  });
  return changes;
}

export function calcAverageHappiness(audienceMembers:AudienceMember[]):number {
  let totalHappiness = 0, totalMemberCount = 0;
  audienceMembers.forEach(audienceMember => {
    totalMemberCount += audienceMember.count;
    totalHappiness += (audienceMember.happiness * audienceMember.count);
  });
  return totalMemberCount > 0 ? totalHappiness / totalMemberCount : 0;
}

/* Updates audience members with happiness changes, publishing corresponding events for UI components to respond to. */
export function applyHappinessChanges(averageHappiness:number, happinessChanges:HappinessChange[], audienceMembers:AudienceMember[], 
    onSetHappiness:SetHappinessCallback, onAverageHappinessChange:AverageHappinessChangeCallback):number {
  if (!happinessChanges.length) return averageHappiness;
  happinessChanges.forEach(change => {
    const audienceMember = _findAudienceMemberByCharacterId(audienceMembers, change.characterId);
    assertNonNullable(audienceMember);
    const oldHappiness = audienceMember.happiness;
    audienceMember.happiness = clamp(oldHappiness + change.happinessDelta, 0, 1);
    if (isClose(oldHappiness, audienceMember.happiness)) return;
    onSetHappiness(audienceMember.characterId, audienceMember.happiness);
  });
  const nextAverageHappiness = calcAverageHappiness(audienceMembers);
  if (!isClose(averageHappiness, nextAverageHappiness)) onAverageHappinessChange(nextAverageHappiness);
  return nextAverageHappiness;
}