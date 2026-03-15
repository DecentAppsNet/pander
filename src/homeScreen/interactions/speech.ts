import { enableSpeech, initSpeech } from "@/speech/speechUtil";
import { promptFromSpeech } from "./game";

export async function enableSpeechAfterDialog(setModalDialogName:Function, setIsSpeechEnabled:Function) {
  await initSpeech(promptFromSpeech);
  setModalDialogName(null);
  enableSpeech();
  setIsSpeechEnabled(true);
}