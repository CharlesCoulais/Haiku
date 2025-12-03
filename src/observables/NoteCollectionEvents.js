import { Observable } from "shibirx";
import StorageItem from "../libs/storage";


class NoteCollectionEvents$ extends Observable {
  constructor(dataChangeSubject) {
    super(subscriber => {
      const subscription = dataChangeSubject.subscribe({
        next: state => this.#sendEvent(subscriber, state),
        error: error => subscriber.error(error),
        complete: () => {
          subscriber.next({ type: 'remove' });
          subscriber.complete();
        },
      });
      return () => subscription.unsubscribe();
    });
  }

  #sendEvent(subscriber, { current, previous }) {
    if (previous === StorageItem.EMPTY) {
      subscriber.next({ type: 'init' });
      return;
    }
    if (current === StorageItem.EMPTY) {
      subscriber.next({ type: 'delete' });
      return;
    }
    if (current.length === previous.length) {
      subscriber.next({ type: 'note:change', noteId: current[0] });
      return;
    }
    const difference = [...new Set(current).difference(new Set(previous))];
    if (current.length > previous.length) {
      subscriber.next({ type: 'note:create', noteId: difference[0] });
      return;
    }
    if (current.length < previous.length) {
      subscriber.next({ type: 'note:remove', noteId: difference[0] });
      return;
    }
  }
}

export default NoteCollectionEvents$;