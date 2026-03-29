import { enableSpeech, initSpeech } from "@/speech/speechUtil";
import { promptFromSpeech, onStopTalking } from "./game";

export async function enableSpeechAfterDialog(setModalDialogName:Function, setIsSpeechEnabled:Function) {
  await initSpeech(promptFromSpeech, onStopTalking);
  setModalDialogName(null);
  enableSpeech();
  setIsSpeechEnabled(true);
}