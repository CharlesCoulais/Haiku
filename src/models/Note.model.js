 import { Subject } from 'shibirx';
 import StorageItem from '../libs/storage.js';
import NoteLifecycleEvents$ from '../observables/NoteLifecycleEvents.js';


const LAST_ITEM_ID = 'lastId';

class NoteModel {
  #events$;
  #storageItem;
  #id;

  get #data() {
    return this.#storageItem.value === StorageItem.EMPTY
      ? null
      : this.#storageItem.value;
  }

  get id() {
    return this.#id;
  }

  get modified() {
    return this.#dateToFrString(this.#data.modified);
  }

  get title() {
    return this.#data.content?.trim?.().match(/(.*)(?:\r\n|$)/)[0] || '';
  }

  get isSaved() {
    return this.#id !== null;
  }

  get content() {
    return this.#data.content;
  }

  set content(contentStr) {
    if (!this.isSaved) {
      this.#registerItem();
    }
    this.#storageItem.value = {
      content: contentStr,
      modified: Date.now(),
    };
  }

  get nodeContent() {
    const temp = document.createElement('template');
    temp.innerHTML = this.htmlContent
    return temp.content;
  }

  get htmlContent() {
    let hasTitle = false;

    return text.split(/\r\n/)
      .map(t => {
        if (!t) {
          return '<div class="br"><br/></div>';
        }
        if (!hasTitle && !!t.trim().length) {
          hasTitle = true;
          return `<div><h1 class="text title">${t}</h1></div>`
        }
        return `<div class="text">${t}</div>`
      })
      .join('');
  }

  constructor(noteId = null) {
    this.#id = noteId;
    this.#storageItem = new StorageItem(localStorage, noteId, { content: '', modified: undefined });
    this.#events$ = new NoteLifecycleEvents$(this.#storageItem.change$);
  }

  subscribe(subscriber) {
    return this.#events$.subscribe(subscriber);
  }

  delete() {
    if (this.#data === null) {
      return;
    }
    this.#storageItem.remove();

  }

  #dateToFrString(timestamp) {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    const monthes = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${date.getDate()} ${monthes[date.getMonth()]} ${date.getFullYear()} à ${this.#twoDigits(date.getHours())}: ${this.#twoDigits(date.getMinutes())} `
  }

  #twoDigits(num) {
    return (num > 10 ? '' : '0') + num;
  }

  #registerItem() {
    this.#id = this.#generateId();
    this.#storageItem.setKey(this.#id);
    NoteModel.#collection[this.#id] = this;
    NoteModel.#onNewIdSubs.next(this.#id);
  }

  #generateId() {
    const lastIdItem = new StorageItem(localStorage, LAST_ITEM_ID, 0);
    return ++lastIdItem.value;
  }


  static #onNewIdSubs = new Subject();
  static #collection = {};

  static getInstance(noteId = null) {
    if (noteId === null) {
      return new NoteModel(null);
    }

    if (!(noteId in this.#collection)) {
      const noteModel = new NoteModel(noteId);
      this.#collection[noteId] = noteModel;
    }

    return this.#collection[noteId];
  }

  static onNewId(callback) {
    return this.#onNewIdSubs.subscribe(callback);
  }
}

export default NoteModel;