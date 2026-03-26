import { enableSpeech, initSpeech } from "@/speech/speechUtil";
import { promptFromSpeech, onUpdateCoherence, onStopTalking } from "./game";

export async function enableSpeechAfterDialog(setModalDialogName:Function, setIsSpeechEnabled:Function) {
  await initSpeech(promptFromSpeech, onUpdateCoherence, onStopTalking);
  setModalDialogName(null);
  enableSpeech();
  setIsSpeechEnabled(true);
}