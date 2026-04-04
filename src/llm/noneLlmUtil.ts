import { eliza } from "./elizaUtil";
import LLMConnection from "./types/LLMConnection";
import LLMConnectionType from "./types/LLMConnectionType";
import LLMMessages from "./types/LLMMessages";
import StatusUpdateCallback from "./types/StatusUpdateCallback";

export async function noneLlmConnect(_modelId:string, connection:LLMConnection, onStatusUpdate:StatusUpdateCallback):Promise<boolean> {
  connection.connectionType = LLMConnectionType.NONE;
  connection.webLLMEngine = null;
  onStatusUpdate('Not using an LLM.', 1);
  return true;
}

export async function noneLlmGenerate(messages:LLMMessages, onStatusUpdate:StatusUpdateCallback):Promise<string> {
  const lastUserMessage = messages.chatHistory.length > 0 ? messages.chatHistory[messages.chatHistory.length - 1].content : '';
  const message = eliza(lastUserMessage); // An easter egg for users of the "None" model.
  onStatusUpdate(message, 1);
  return message;
}