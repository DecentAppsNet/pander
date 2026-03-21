import { enableSpeech, initSpeech } from "@/speech/speechUtil";
import { promptFromSpeech, onUpdateCoherence } from "./game";

export async function enableSpeechAfterDialog(setModalDialogName:Function, setIsSpeechEnabled:Function) {
  await initSpeech(promptFromSpeech, onUpdateCoherence);
  setModalDialogName(null);
  enableSpeech();
  setIsSpeechEnabled(true);
}