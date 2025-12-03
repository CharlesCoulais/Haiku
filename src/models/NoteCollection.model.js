import NoteModel from './Note.model.js';
import StorageItem from '../libs/storage.js';
import NoteCollectionEvents$ from '../observables/NoteCollectionEvents.js';


const COLLECTION_ITEM = 'noteList';

class NoteCollectionModel {
  #events$;
  #storageItem;

  get #data() {
    return this.#storageItem.value;
  }

  get list() {
    return [ ...this.#data ];
  }

  constructor() {
    this.#storageItem = new StorageItem(localStorage, COLLECTION_ITEM, []);
    this.#events$ = new NoteCollectionEvents$(this.#storageItem.change$);
    this.#data.forEach(noteId => this.#subscribeToNoteEvents(noteId));

    NoteModel.onNewId(noteId => this.addNoteId(noteId));
  }

  map(fn) {
    return this.#data.map(fn);
  }

  getLastModified() {
    if (!this.#data.length) {
      return null;
    }
    return NoteModel.getInstance(this.#data[0]);
  }

  getNoteIndex(noteId) {
    return noteId !== null
      ? this.#data.findIndex(id => noteId === id)
      : -1;
  }

  subscribe(subscriber) {
    return this.#events$.subscribe(subscriber);
  }

  #subscribeToNoteEvents(noteId) {
    const noteModel = NoteModel.getInstance(noteId);
    noteModel.subscribe(({ type }) => {
      switch (type) {
        case 'create':
        case 'change':
          this.putNoteOnTop(noteId);
          break;
        case 'remove':
          this.removeNote(noteId);
          break;
      }
    });
  }

  addNoteId(noteId) {
    this.#storageItem.value= [ noteId, ...this.#data];
    this.#subscribeToNoteEvents(noteId);
  }

  putNoteOnTop(noteId) {
    this.#storageItem.value = [
      noteId,
      ...this.#data.filter(id => id !== noteId),
    ];
  }

  removeNote(noteId) {
    this.#storageItem.value = this.#data.filter(id => id !== noteId);
  }

  static #instance = null;

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new NoteCollectionModel();
    }
    return this.#instance;
  }
}

export default NoteCollectionModel;