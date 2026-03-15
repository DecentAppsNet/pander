/* This module intentionally reads from files every time instead of 
   storing to data structures so that changes to files in the middle 
   of a game session can be applied without reloading the app. */

import { parseNameValueLines, parseSections } from "@/common/markdownUtil";
import { baseUrl } from "@/common/urlUtil";
import AudienceMember from "./types/AudienceMember";
import { DEFAULT_HAPPINESS } from "./happinessUtil";
import CharacterDrawSettings from "./types/CharacterDrawSettings";
import CellRange from "./types/CellRange";

async function _getCharactersText():Promise<string> {
  const response = await fetch(baseUrl('/characters/characters.md'));
  return await response.text();
}

function _parseDelimitedListValue(list?:string):string[] {
  if (!list || list === '') return [];
  return list.split('|').map(i => i.trim()).filter(i => i.length > 0);
}

/* The characters.md file is a mix of settings for game logic and UI/assets. This function
   returns the latter. Leave any UI-related processing/loading for the caller. */
export async function loadCharacterDrawSettings():Promise<CharacterDrawSettings> {
  const charactersText = await _getCharactersText();
  const sections = parseSections(charactersText);
  const generalSectionText = sections.General;
  if (!generalSectionText) throw Error('No "General" section found in character settings file.');
  const nameValuePairs = parseNameValueLines(generalSectionText);
  const spriteMapUrl = nameValuePairs.spriteMapUrl;
  const bodyWidth = parseInt(nameValuePairs.bodyWidth);
  const bodyHeight = parseInt(nameValuePairs.bodyHeight);
  if (!spriteMapUrl) throw Error('No "spriteMapUrl" found in "General" section of character settings file.');
  if (!bodyWidth) throw Error('No "bodyWidth" found in "General" section of character settings file.');
  if (!bodyHeight) throw Error('No "bodyHeight" found in "General" section of character settings file.');
  
  const settings:CharacterDrawSettings = {
    bodyWidth,
    bodyHeight,
    spriteMapUrl,
    characters: {}
  }
  const characterIds = Object.keys(sections).filter(sectionName => sectionName !== 'General');
  characterIds.forEach(characterId => {
    const characterSectionText = sections[characterId];
    const nameValuePairs = parseNameValueLines(characterSectionText);
    const bodyStartCellNo = parseInt(nameValuePairs.bodyStartCellNo);
    const bodyCellCount = parseInt(nameValuePairs.bodyCellCount);
    if (isNaN(bodyStartCellNo)) throw Error(`No "bodyStartCellNo" found in "${characterId}" section of character settings file.`);
    if (isNaN(bodyCellCount)) throw Error(`No "bodyCellCount" found in "${characterId}" section of character settings file.`);
    const bodyCellRange:CellRange = { startCellNo: bodyStartCellNo, cellCount: bodyCellCount };
    settings.characters[characterId] = bodyCellRange;
  });
  return settings;
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
