import Code from "@/spielCode/types/Code";
import ActionType from "./ActionType";
import MessageSet from "./MessageSet";

export type DisplayMessageAction = {
  actionType:ActionType.NARRATION_MESSAGE;
  messages:MessageSet;
  criteria:Code|null;
}

export type InstructionMessageAction = {
  actionType:ActionType.INSTRUCTION_MESSAGE;
  messages:MessageSet;
  criteria:Code|null;
}

export type PlayerMessageAction = {
  actionType:ActionType.PLAYER_MESSAGE;
  messages:MessageSet;
  criteria:Code|null;
}

export type CharacterMessageAction = {
  actionType:ActionType.CHARACTER_MESSAGE;
  messages:MessageSet;
  criteria:Code|null;
}

export type MessageAction = DisplayMessageAction | InstructionMessageAction | PlayerMessageAction | CharacterMessageAction;

export type CodeAction = {
  actionType:ActionType.CODE;
  code:Code;
}

export type ReprocessAction = {
  actionType:ActionType.REPROCESS;
  criteria:Code|null;
}

type Action = MessageAction | CodeAction | ReprocessAction;

export default Action;