import { assertNonNullable } from "decent-portal";

import AudienceMember from "./types/AudienceMember";
import { clamp, isClose } from "@/common/mathUtil";
import HappinessChange from "./types/HappinessChange";
import { promptToUniqueWords, WordCooldownFactorCallback } from "./wordAnalysisUtil";
import LevelResults from "./types/LevelResults";

export const DEFAULT_HAPPINESS = .5;
export const LOVE_BUMP = .2;
export const LIKE_BUMP = .1; 
export const DISLIKE_BUMP = -.1;
export const HATE_BUMP = -.2;

export type SetHappinessCallback = (characterId:string, triggerWord:string, happiness:number) => void;
export type FindHappinessChangeCallback = (playerText:string, audienceMember:AudienceMember, onWordCooldownFactor:WordCooldownFactorCallback) => Promise<number>;
export type AverageHappinessChangeCallback = (happiness:number) => void;
export type EndLevelCallback = (levelResults:LevelResults) => void;

function _findAudienceMemberByCharacterId(audienceMembers:AudienceMember[], characterId:string):AudienceMember|null {
  return audienceMembers.find(am => am.characterId === characterId) || null;
}

/* Returns a number representing the amount by which happiness should change. */
async function _findHappinessChange(playerText:string, audienceMember:AudienceMember, 
      onWordCooldownFactor:WordCooldownFactorCallback):Promise<{happinessDelta:number, triggerWord:string}|null> {
  const words = promptToUniqueWords(playerText);
  if (!words.length) return null;
  let happinessDelta = 0, triggerWord = '';
  words.forEach(word => {
    if (audienceMember.loves.includes(word)) {
      triggerWord = word;
      happinessDelta += (LOVE_BUMP * onWordCooldownFactor(word));
    } else if (audienceMember.likes.includes(word)) {
      triggerWord = word;
      happinessDelta += (LIKE_BUMP * onWordCooldownFactor(word));
    } else if (audienceMember.dislikes.includes(word)) {
      if (triggerWord === '') triggerWord = word;
      happinessDelta += (DISLIKE_BUMP * onWordCooldownFactor(word));
    }
    else if (audienceMember.hates.includes(word)) {
      if (triggerWord === '') triggerWord = word;
      happinessDelta += (HATE_BUMP * onWordCooldownFactor(word));
    }
  });
  return happinessDelta === 0 ? null : { happinessDelta, triggerWord };
}

/* Finds all happiness changes for audience members in response to player text. */
export async function findHappinessChangesForAudience(playerText:string, audienceMembers:AudienceMember[], onWordCooldownFactor:WordCooldownFactorCallback):Promise<HappinessChange[]> {
  const changes:HappinessChange[] = [];
  audienceMembers.forEach(async (audienceMember) => {
    const result = await _findHappinessChange(playerText, audienceMember, onWordCooldownFactor);
    if (result) changes.push({characterId:audienceMember.characterId, triggerWord:result.triggerWord, happinessDelta:result.happinessDelta});
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
    onSetHappiness(audienceMember.characterId, change.triggerWord, audienceMember.happiness);
  });
  const nextAverageHappiness = calcAverageHappiness(audienceMembers);
  if (!isClose(averageHappiness, nextAverageHappiness)) onAverageHappinessChange(nextAverageHappiness);
  return nextAverageHappiness;
}

export function createGlobalHappinessChangesForAudience(happinessDelta:number, audienceMembers:AudienceMember[]):HappinessChange[] {
  return audienceMembers.map(am => { return { happinessDelta, characterId:am.characterId, triggerWord:'' } });
}

export function getLevelResults(audienceMembers:AudienceMember[]):LevelResults {
  const averageHappiness = calcAverageHappiness(audienceMembers);
  const isComplete = averageHappiness >= .8;
  return { isComplete, finalHappiness:averageHappiness };
}