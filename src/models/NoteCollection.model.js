import NoteModel from './Note.model.js';
import { SubscriberCollection } from '../libs/observable.js';
import Storage from '../libs/storage.js';


const COLLECTION_ITEM = 'noteList';

class NoteCollectionModel {
  #subscribers = new SubscriberCollection();
  #localStorageItem;
  #data = [];

  get list() {
    return [ ...this.#data ];
  }

  constructor() {
    this.#localStorageItem = Storage.getItem(COLLECTION_ITEM, []);
    this.#data = this.#localStorageItem.value;
    this.#data.forEach(noteId => this.#subscribeToNoteChanges(noteId));

    NoteModel.onNewId(noteId => this.addNoteId(noteId));
  }

  map(fn) {
    return this.#data.map(fn);
  }

  getLastModified() {
    if (!this.#data.length) {
      return null;
    }
    return  NoteModel.getInstance(this.#data[0]);
  }

  subscribe(subscriber) {
    return this.#subscribers.subscribe(subscriber);
  }

  addNoteId(noteId, blockBroadcast = false) {
    this.#data.unshift(noteId);
    this.#save();
    this.#subscribeToNoteChanges(noteId);
    this.#subscribers.emit({ type: 'create', noteId }, blockBroadcast);
  }

  #subscribeToNoteChanges(noteId) {
    const noteModel = NoteModel.getInstance(noteId);
    noteModel.subscribe(({ type }, blockBroadcast) => {
      switch (type) {
        case 'refresh':
        case 'change':
          this.putNoteOnTop(noteId, blockBroadcast);
          break;
        case 'delete':
          this.removeNote(noteId, blockBroadcast);
          break;
      }
    });
  }

  putNoteOnTop(noteId, blockBroadcast = false) {
    this.#data = [
      noteId,
      ...this.#data.filter(id => id !== noteId),
    ];
    this.#save();
    this.#subscribers.emit({ type: 'change', noteId }, blockBroadcast);
  }

  removeNote(noteId, blockBroadcast = false) {
    this.#subscribers.emit({ type: 'beforeRemove', noteId }, blockBroadcast);
    this.#data = this.#data.filter(id => id !== noteId);
    this.#save();
    this.#subscribers.emit({ type: 'remove', noteId }, blockBroadcast);
  }

  #save() {
    this.#localStorageItem.value = [...this.#data];
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