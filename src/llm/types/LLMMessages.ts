import LLMMessage, { duplicateLLMMessage } from "./LLMMessage";

type LLMMessages = {
  chatHistory:LLMMessage[],
  maxChatHistorySize:number;
  systemMessage:string|null;
}

export function duplicateLLMMessages(from:LLMMessages):LLMMessages {
  return {
    chatHistory: from.chatHistory.map(duplicateLLMMessage),
    maxChatHistorySize: from.maxChatHistorySize,
    systemMessage: from.systemMessage
  };
}

export default LLMMessages;