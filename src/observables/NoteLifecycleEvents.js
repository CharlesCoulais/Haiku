import { Observable } from "shibirx";
import StorageItem from "../libs/storage";


class NoteLifecycleEvents$ extends Observable {
  #lastEvent;

  constructor(dataChangeSubject) {
    super(subscriber => {
      const subscription = dataChangeSubject.subscribe({
        next: state => this.#sendEvent(subscriber, state),
        error: error => subscriber.error(error),
        complete: () => {
          if (this.#lastEvent !== 'remove') {
            subscriber.next({ type: 'remove' });
          }
          subscriber.complete();
        },
      });

      return () => subscription.unsubscribe();
    });
  }

  #sendEvent(subscriber, { current, previous }) {
    let eventType;
    if (previous === StorageItem.EMPTY) {
      eventType = 'create';
    }
    else if (current === StorageItem.EMPTY) {
      eventType = 'remove';
    }
    else {
      eventType = 'change';
    }
    this.#lastEvent = eventType;
    subscriber.next({ type: eventType });
  }
}

export default NoteLifecycleEvents$;
