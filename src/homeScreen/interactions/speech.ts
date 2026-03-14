import { enableSpeech, initSpeech } from "@/speech/speechUtil";

export async function enableSpeechAfterDialog(setModalDialogName:Function) {
  setModalDialogName(null);
  await initSpeech();
  enableSpeech();
}