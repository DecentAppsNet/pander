import type Recognizer from "sl-web-speech/dist/speech/Recognizer";

let theRecognizer:Recognizer|null = null;
let theIsSpeechEnabled = false;
let theInitSpeechPromise:Promise<boolean>|null = null;

export type StringCallback = (s:string) => void;

function _onPartial(message:string) {
  console.log(message);
  // TODO - hook up to a game session.
}

export async function initSpeech():Promise<boolean> {
  if (theInitSpeechPromise) return theInitSpeechPromise;
  theInitSpeechPromise = new Promise<boolean>(async (resolve) => {

    const { Recognizer, setModelsBaseUrl } = await import("sl-web-speech");

    function _onReady() {
      if (!theRecognizer) throw Error('Unexpected');
      theRecognizer.bindCallbacks(_onPartial, () => {}, () => {}, () => {});
      resolve(true);
    }

    setModelsBaseUrl('/speech-models/');
    try {
      theRecognizer = new Recognizer(_onReady);
    } catch(e) {
      console.error('Error while initializing speech recognizer.', e);
      resolve(false);
    }
  });
  return theInitSpeechPromise;
}

export function isSpeechAvailable():boolean {
  return theRecognizer !== null;
}

export function isSpeechEnabled():boolean {
  return theIsSpeechEnabled;
}

export function toggleSpeech():boolean {
  if (!theRecognizer) return theIsSpeechEnabled;
  if (theIsSpeechEnabled) theRecognizer.mute();
  else theRecognizer.unmute();
  theIsSpeechEnabled = !theIsSpeechEnabled;
  return theIsSpeechEnabled;
}

export function enableSpeech() {
  if (!theRecognizer || theIsSpeechEnabled) return;
  theRecognizer.unmute();
  theIsSpeechEnabled = true;
}