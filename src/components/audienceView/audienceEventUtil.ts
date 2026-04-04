import EventTopic, { ReceiveEventCallback } from "./EventTopic";

// One topic for each event type.
const theSetHappinessEvents:EventTopic<SetHappinessEvent> = new EventTopic<SetHappinessEvent>();

export function setHappiness(characterId:string, triggerWord:string, happiness:number) {
  theSetHappinessEvents.publish({characterId, triggerWord, happiness});
}

export function subscribeSetHappiness(callback:ReceiveEventCallback<SetHappinessEvent>) {
  theSetHappinessEvents.subscribe(callback);
}