import { Subject } from "shibirx";
import NoteCollectionModel from "../models/NoteCollection.model.js";
import NoteModel from "../models/Note.model.js";


class NoteCollectionCursor$ extends Subject {
  #currentIndex;
  #currentSub;

  constructor() {
    super();
    const collectionModel = NoteCollectionModel.getInstance();
    this.set(collectionModel.getLastModified());
  }

  set(noteModel) {
    if (this.isCurrent(noteModel)) {
      return;
    }
    this.#currentSub?.unsubscribe();
    this.#currentIndex = NoteCollectionModel.getInstance().getNoteIndex(noteModel.id);
    this.#currentSub = noteModel.subscribe(e => this.#onNoteEvent(e));
    super.next(noteModel);
  }

  isCurrent(noteModel) {
    return this.value === noteModel;
  }

  subscribe(subscriber) {
    return super.subscribe(subscriber);
  }

  #onNoteEvent({ type }) {
    switch(type) {
      case 'create':
      case 'change':
        this.#currentIndex = NoteCollectionModel.getInstance().getNoteIndex(this.value.id);
        break;
      case 'remove':
        this.#next();
        break;
    }
  }

  #next() {
    let id = null;
    const noteIdList = NoteCollectionModel.getInstance().list;

    if (this.#currentIndex > 0) {
      id = noteIdList[this.#currentIndex - 1];
    } else if (this.#currentIndex === 0 && noteIdList.length > 1) {
      id = noteIdList[0];
    }

    this.set(id === null ? null : NoteModel.getInstance(id));
  }
}

export default NoteCollectionCursor$;