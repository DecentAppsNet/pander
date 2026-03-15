/* This module intentionally reads from files every time instead of 
   storing to data structures so that changes to files in the middle 
   of a game session can be applied without reloading the app. */

import { parseNameValueLines, parseSections } from "@/common/markdownUtil";
import { baseUrl } from "@/common/urlUtil";
import AudienceMember from "./types/AudienceMember";
import { DEFAULT_HAPPINESS } from "./happinessUtil";

async function _getCharactersText():Promise<string> {
  const response = await fetch(baseUrl('/characters/characters.md'));
  return await response.text();
}

function _parseDelimitedListValue(list?:string):string[] {
  if (!list || list === '') return [];
  return list.split('|').map(i => i.trim()).filter(i => i.length > 0);
}

export async function loadAudienceMember(characterId:string):Promise<AudienceMember> {
  const charactersText = await _getCharactersText();
  const sections = parseSections(charactersText);
  const characterSection = sections[characterId];
  if (!characterSection) throw Error(`Did not find "${characterId}" section in characters.md`);
  const nameValuePairs = parseNameValueLines(characterSection);
  const audienceMember:AudienceMember = {
    characterId,
    count:1,
    happiness: nameValuePairs.happiness ? parseFloat(nameValuePairs.happiness) : DEFAULT_HAPPINESS,
    likes:_parseDelimitedListValue(nameValuePairs.likes),
    dislikes:_parseDelimitedListValue(nameValuePairs.dislikes),
    loves:_parseDelimitedListValue(nameValuePairs.loves),
    hates:_parseDelimitedListValue(nameValuePairs.hates)
  };
  return audienceMember;
}
