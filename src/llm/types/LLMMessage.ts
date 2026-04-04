type LLMMessage = {
  role: string;
  content: string;
  tool_call_id?: string;
}

export function duplicateLLMMessage(from:LLMMessage):LLMMessage {
  return {
    role: from.role,
    content: from.content,
    tool_call_id: from.tool_call_id
  };
}

export default LLMMessage;