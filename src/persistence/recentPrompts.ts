import { getText, setText } from "./pathStore";

const MAX_RECENT_PROMPTS = 100;

function _key(encounterTitle:string):string {
  return `/recentPrompts/${encounterTitle}.txt`;
}

export async function getRecentPrompts(encounterTitle:string):Promise<string[]> {
  const text = await getText(_key(encounterTitle));
  return text === null ? [] : text.split('\n');
}

export async function appendRecentPrompt(encounterTitle:string, prompt:string):Promise<string[]> {
  let prompts = await getRecentPrompts(encounterTitle);
  if (prompts.length >= MAX_RECENT_PROMPTS) prompts = prompts.slice(prompts.length - MAX_RECENT_PROMPTS + 1);
  prompts.push(prompt);
  await setText(_key(encounterTitle), prompts.join('\n'));
  return prompts;
}