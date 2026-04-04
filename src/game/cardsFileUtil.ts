import { NameValues, parseNameValueLines, parseSections } from "@/common/markdownUtil";
import { baseUrl } from "@/common/urlUtil";   

/* This module intentionally reads from files every time instead of 
   storing to data structures so that changes to files in the middle 
   of a game session can be applied without reloading the app. */
   
async function _getCardsText():Promise<string> {
  const response = await fetch(baseUrl('/levels/cards.md'));
  return await response.text();
}

export async function findCardInfo(cardId:string):Promise<NameValues> {
  const cardsText = await _getCardsText();
  const sections = parseSections(cardsText);
  const cardSectionText = sections[cardId];
  if (!cardSectionText) throw Error(`Could not find section for "${cardId}" in /levels/cards.md.`);
  return parseNameValueLines(cardSectionText);
}