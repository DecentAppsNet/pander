export type ReceiveEventCallback<T> = (event: T) => void;

class EventTopic<T> {
  private _receiveEventCallback: ReceiveEventCallback<T>|null = null;

  subscribe(onReceiveEvent: ReceiveEventCallback<T>) {
    this._receiveEventCallback = onReceiveEvent;
  }

  publish(event: T) {
    if (!this._receiveEventCallback) return;
    this._receiveEventCallback(event);
  }
}

export default EventTopic;