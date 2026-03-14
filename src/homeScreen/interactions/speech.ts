import { enableSpeech, initSpeech } from "@/speech/speechUtil";

export async function enableSpeechAfterDialog(setModalDialogName:Function, setIsSpeechEnabled:Function) {
  await initSpeech();
  setModalDialogName(null);
  enableSpeech();
  setIsSpeechEnabled(true);
}