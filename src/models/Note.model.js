 import { SubscriberCollection } from '../libs/observable.js';
 import Storage from '../libs/storage.js';


 const LAST_ID_ITEM = 'lastId';

class NoteModel {
  #subscribers = new SubscriberCollection();
  #localStorageItem;
  #data;
  #id;

  get id() {
    return this.#id;
  }

  get data() {
    return this.#data;
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
    this.#data.content = contentStr;
    this.#data.modified = Date.now();
    this.#save();
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
    if (noteId !== null) {
      this.#localStorageItem = Storage.getItem(noteId);
      this.#data = {
        content: this.#localStorageItem.value?.content,
        modified: this.#localStorageItem.value?.modified,
      };
    } else {
      this.#data = {
        content: '',
        modified: undefined,
      };
    }
  }

  refresh(blockBroadcast = false) {
    if (!this.#localStorageItem) {
      return;
    }
    this.#localStorageItem.refresh();
    this.#data = {
      content: this.#localStorageItem.value?.content,
      modified: this.#localStorageItem.value?.modified,
    };
    this.#subscribers.emit({ type: 'refresh', data: { ...this.#data } }, blockBroadcast);
  }

  subscribe(subscriber) {
    return this.#subscribers.subscribe(subscriber);
  }

  delete(blockBroadcast = false) {
    if (this.#data === null) {
      return;
    }
    const data = { ...this.#data };
    this.#data = null;
    this.#subscribers.emit({ type: 'beforeDelete', data: { ...this.#data } }, blockBroadcast);
    this.#localStorageItem?.delete();
    this.#subscribers.emit({ type: 'delete', data: null }, blockBroadcast);
    this.#subscribers.destroy();
    this.#subscribers = null;
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

  #save() {
    const existsInStorage = (this.#id !== null);
    if (!existsInStorage) {
      const lastIdItem = Storage.getItem(LAST_ID_ITEM, 0);
      this.#id = ++lastIdItem.value;
      this.#localStorageItem = Storage.getItem(this.#id);
      NoteModel.#collection[this.#id] = this;
      NoteModel.#onNewIdSubs.emit(this.#id);
    }
    this.#localStorageItem.value = { ...this.#data };
    // If it juct created the id in storage, does not send broadcast 'change' message:
    // the channel already sent a 'create' message.
    this.#subscribers.emit({ type: 'change', data: { ...this.#data } }, !existsInStorage);
  }


  static #onNewIdSubs = new SubscriberCollection();
  static #collection = {};

  static getInstance(noteId) {
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