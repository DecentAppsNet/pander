import LLMConnection from "./types/LLMConnection";
import LLMConnectionType from "./types/LLMConnectionType";
import LLMMessages from "./types/LLMMessages";
import StatusUpdateCallback from "./types/StatusUpdateCallback";
import { createChatHistory } from "./messageUtil";

import { FilesetResolver, LlmInference } from "@mediapipe/tasks-genai";

/**
 * Interface layer for Gemma 4 using the @mediapipe/tasks-genai engine 
 * with the new Gemma 4 specific control tokens and format.
 * 
 * Gemma 4 prompt structure:
 * <|turn>system\nSystem instruction<turn|>\n<|turn>user\nUser prompt<turn|>\n<|turn>model\n
 */
const GEMMA4_MODEL_URLS: Record<string, string> = {
    'Gemma 4 E2B': '/litert-models/gemma-4-E2B-it-web.task',
    'Gemma 4 E4B': '/litert-models/gemma-4-E4B-it-web.task'
};

function _resolveModelUrl(modelId: string): string {
    return GEMMA4_MODEL_URLS[modelId] ?? modelId; // fall back to treating modelId as a direct URL
}

/*
  Public APIs
*/

export async function gemma4Connect(modelId: string, connection: LLMConnection, onStatusUpdate: StatusUpdateCallback): Promise<boolean> {
    try {
        connection.connectionType = LLMConnectionType.GEMMA4;
        onStatusUpdate("Loading Mediapipe WASM for Gemma 4...", 0.1);

        const genaiWasm = await FilesetResolver.forGenAiTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@0.10.27/wasm" // Loading latest from CDN to guarantee Gemma 4 compatibility
        );

        const modelUrl = _resolveModelUrl(modelId);
        onStatusUpdate("Initializing Gemma 4 LiteRT-LM...", 0.3);
        connection.mediapipeEngine = await LlmInference.createFromOptions(genaiWasm, {
            baseOptions: {
                modelAssetPath: modelUrl
            },
            // These settings specifically for Pander - no creativity, small token use.
            maxTokens: 1024,
            topK: 128,
            temperature: 0,
            randomSeed: 0
        });

        return true;
    } catch (e) {
        console.error('Error while connecting to Gemma 4.', e);
        return false;
    }
}

export async function gemma4Generate(connection: LLMConnection, llmMessages: LLMMessages, onStatusUpdate: StatusUpdateCallback): Promise<string> {
    const engine = connection.mediapipeEngine;
    if (!engine) throw Error('Unexpected: Engine is null');

    // Convert messages to string layout that Gemma 4 expects.
    let promptText = llmMessages.systemMessage ? `<|turn>system\n${llmMessages.systemMessage}<turn|>\n` : '';
    const chatHistory = createChatHistory(llmMessages);

    for (const msg of chatHistory) {
      if (msg.role === 'assistant') {
        promptText += `<|turn>model\n${msg.content}<turn|>\n`;
      } else {
        promptText += `<|turn>${msg.role}\n${msg.content}<turn|>\n`;
      }
    }
    // End the prompt indicating it's the model's turn to generate.
    promptText += `<|turn>model\n`;

    let fullMessage = '';
    
    try {
        await engine.generateResponse(promptText, (partialResult: string, done: boolean) => {
          fullMessage += partialResult;
          onStatusUpdate(fullMessage, done ? 1 : 0);
        });
    } catch (e) {
      console.error("Error generating response", e);
      throw e;
    }

    return fullMessage;
}
