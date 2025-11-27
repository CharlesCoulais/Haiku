import NoteModel from './Note.model.js';
import { SubscriberCollection } from '../libs/observable.js';
import StorageItem from '../libs/storage.js';


const COLLECTION_ITEM = 'noteList';

class SessionGarbageModel {
  #subscribers = new SubscriberCollection();
  #storageItem;
  #data = [];

  get list() {
    return [ ...this.#data ];
  }

  constructor() {
    this.#storageItem = new StorageItem(localStorage, COLLECTION_ITEM, []);
    this.#data = this.#storageItem.value;
  }

  getLastDeleted() {
    if (!this.#data.length) {
      return null;
    }
    return NoteModel.getInstance(this.#data[0]);
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
        case 'recover':
          this.recoverNote(noteId, blockBroadcast);
          break;
      }
    });
  }

  recoverNote(noteId, blockBroadcast = false) {
    this.#subscribers.emit({ type: 'beforeRecover', noteId }, blockBroadcast);
    this.#data = this.#data.filter(id => id !== noteId);
    this.#save();
    this.#subscribers.emit({ type: 'recover', noteId }, blockBroadcast);
  }

  #save() {
    this.#storageItem.value = [...this.#data];
  }

  static #instance = null;

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new SessionGarbageModel();
    }
    return this.#instance;
  }
}

export default SessionGarbageModel;