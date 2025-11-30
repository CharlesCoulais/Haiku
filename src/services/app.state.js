import { SubscriberCollection } from "./libs/observable.js";
import NoteModel from "./models/Note.model.js";
import NoteCollectionModel from "./models/NoteCollection.model.js";


class CurrentNote {
  #subscribers = new SubscriberCollection();
  #current = null;
  #currentSub = null;

  get value() {
    return this.#current;
  }

  constructor() {
    const models$ = NoteCollectionModel.getInstance();
    this.set(models$.getLastModified());
  }

  set(noteModel) {
    if (this.#current === noteModel) {
      return;
    }
    this.#currentSub?.unsubscribe();
    this.#current = noteModel;
    this.#currentSub = noteModel?.subscribe(e => this.#onBeforeRemoveNote(e));
    this.#subscribers.emit(noteModel);
  }

  isCurrent(noteModel) {
    return this.#current === noteModel;
  }

  subscribe(subscriber) {
    return this.#subscribers.subscribe(subscriber);
  }

  #onBeforeRemoveNote({ type, noteId }) {
    if (type === 'beforeDelete') {
      this.#next();
    }
  }

  #next() {
    const idList = NoteCollectionModel.getInstance().list;

    const index = idList.findIndex(noteId => noteId === this.#current.id);
    let id;

    if (index > 0) {
      id = idList[index - 1];
    } else if (index === 0 && idList.length > 1) {
      id = idList[index + 1];
    } else {
      this.set(null);
      return;
    }

    this.set(NoteModel.getInstance(id));
  }
}


const appState = {
  currentNote$: new CurrentNote(),
};

export const currentNote$ = appState.currentNote$;
export default appState;