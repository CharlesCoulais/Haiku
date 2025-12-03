import NoteModel from './Note.model.js';
import StorageItem from '../libs/storage.js';


const COLLECTION_ITEM = 'noteList';

class SessionGarbageModel {
  #storageItem;
  #data = [];

  constructor() {
    this.#storageItem = new StorageItem(sessionStorage, COLLECTION_ITEM, []);
    this.#data = this.#storageItem.value;
  }

  getLastDeleted() {
    if (!this.#data.length) {
      return null;
    }
    return NoteModel.getInstance(this.#data[0]);
  }

  recoverNote(noteId) {
    this.#data = this.#data.filter(id => id !== noteId);
    this.#save();
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