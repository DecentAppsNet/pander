import { Recognizer, setModelsBaseUrl } from 'sl-web-speech';
import { calcSpeechCoherence } from './coherenceUtil';

export type StringCallback = (s:string) => void;
export type UpdateCoherenceCallback = (coherence:number) => void;

let theRecognizer:Recognizer|null = null;
let theIsSpeechEnabled = false;
let theInitSpeechPromise:Promise<boolean>|null = null;
let theLastPartial:string = '';

function _onUpdateCoherenceFromSpeech(speech:string, onUpdateCoherence:UpdateCoherenceCallback) {
  const coherence = calcSpeechCoherence(speech);
  onUpdateCoherence(coherence);
}

function _onPartial(speech:string, onPromptFromSpeech:StringCallback) {
  if (speech === theLastPartial) return;
  theLastPartial = speech;
  onPromptFromSpeech(speech);
}

export async function initSpeech(onPromptFromSpeech:StringCallback, 
    onUpdateCoherence:UpdateCoherenceCallback, onStopTalking:() => {}):Promise<boolean> {
  if (theInitSpeechPromise) return theInitSpeechPromise;
  theInitSpeechPromise = new Promise<boolean>(async (resolve) => {

    function _onReady() {
      if (!theRecognizer) throw Error('Unexpected');
      theRecognizer.bindCallbacks(
        (speech) => _onPartial(speech, onPromptFromSpeech), 
        () => {}, 
        onStopTalking, 
        (speech) => _onUpdateCoherenceFromSpeech(speech, onUpdateCoherence)
      );
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