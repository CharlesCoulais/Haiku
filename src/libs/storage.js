import sharedSessionStorage from "./sharedSessionStorage";
import { ChangeSubject } from 'shibirx';


class StorageInterface {
  #natStorage;

  get length() {
    return this.#natStorage.length;
  }

  get storage() {
    return this.#natStorage;
  }

  constructor(nativeStorage) {
    this.#natStorage = nativeStorage;
  }

  get(key) {
    const item = this.#natStorage.getItem(key);
    try {
      const value = JSON.parse(item);
      return value?.v ?? value;
    } catch {
      return item;
    }
  }
  set(key, value) {
    if (value === StorageItem.EMPTY) {
      return;
    }
    this.#natStorage.setItem(key, JSON.stringify({ v: value }));
  }
  has(key) {
    return this.#natStorage.getItem(key) !== null;
  }
  remove(key) {
    this.#natStorage.removeItem(key);
  }
  clear() {
    this.#natStorage.clear();
  }

  listenForChange(key, callback) {
    const listener = e => {
      const matchEvent = (e.storageArea === this.#natStorage) && (e.key === key.toString());
      if (matchEvent) {
        const oldValue = e.oldValue === null ? StorageItem.EMPTY : JSON.parse(e.oldValue).v;
        const newValue = e.newValue === null ? StorageItem.EMPTY : JSON.parse(e.newValue).v;
        callback({ oldValue, newValue });
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }

  static #instances = new Map();
  static getInstance(nativeStorage) {
    if (!this.#instances.has(nativeStorage)) {
      this.#instances.set(nativeStorage, new StorageInterface(nativeStorage));
    }
    return this.#instances.get(nativeStorage);
  }
}

class StorageItemCollection {
  #storage;
  #collection = new Map;

  get storage() {
    return this.#storage;
  }

  constructor (storage) {
    this.#storage = storage;
  }

  get(key) {
    return this.#collection.get(key);
  }

  set(key, itemIntance) {
    this.#collection.set(key, itemIntance);
  }

  has(key) {
    return this.#collection.has(key);
  }

  remove(key) {
    return this.#collection.delete(key);
  }

  static #collections = new Map();
  static getInstance(nativeStorage) {
    if (!this.#collections.has(nativeStorage)) {
      const storage = StorageInterface.getInstance(nativeStorage);
      const collection = new StorageItemCollection(storage);
      this.#collections.set(nativeStorage, collection);
    }
    return this.#collections.get(nativeStorage);
  }
}


class StorageItem {
  #storage;
  #key;
  #currentValue$;
  #removeListenerFn;

  get key() {
    return this.#key;
  }

  get value() {
    return this.#currentValue$.value;
  }

  set value(value) {
    if (this.#currentValue$.value !== value) {
      this.#storage.set(this.#key, value);
      this.#currentValue$.next(value);
    }
  }

  get change$() {
    return this.#currentValue$.toObservable();
  }

  constructor(nativeStorage, key = null, defaultValueIfEmpty = StorageItem.EMPTY) {
    const collection = StorageItemCollection.getInstance(nativeStorage);
    if (key !== null && collection.has(key)) {
      return collection.get(key);
    }
    this.#storage = collection.storage;
    this.#key = key;
    this.#currentValue$ = this.#initSubject(defaultValueIfEmpty);
    if (key !== null) {
      collection.set(key, this);
      this.#removeListenerFn = this.#storage.listenForChange(this.#key, e => this.#onStorageEvent(e));
    }
  }

  #initSubject(defaultValue) {
    if (this.#key !== null && this.#storage.has(this.#key)) {
      const value = this.#storage.get(this.#key);
      return new ChangeSubject(value);
    } else if (defaultValue !== StorageItem.EMPTY) {
      this.#storage.set(defaultValue);
      return new ChangeSubject(defaultValue);
    } else {
      return new ChangeSubject(StorageItem.EMPTY);
    }
  }

  remove() {
    if (this.#key !== null) {
      const collection = StorageItemCollection.getInstance(this.#storage);
      collection.remove(this.#key);
      this.#storage.remove(this.#key);
      this.#removeListenerFn();
    }
    this.#currentValue$.next(StorageItem.EMPTY);
    this.#currentValue$.complete();
  }

  setKey(key) {
    const collection = StorageItemCollection.getInstance(this.#storage);
    if (collection.has(key)) {
      throw new Error(`Another storage item own this item key '${key}.'`);
    }
    if (this.#key !== null) {
      collection.remove(this.#key);
      this.#storage.remove(this.#key);
      this.#removeListenerFn();
    }
    this.#key = key;
    this.#storage.set(key, this.#currentValue$.value);
    collection.set(key, this);
    this.#removeListenerFn = this.#storage.listenForChange(this.#key, e => this.#onStorageEvent(e));
  }

  #onStorageEvent({ newValue }) {
    if (newValue === StorageItem.EMPTY) {
      return this.remove();
    }
    this.#currentValue$.next(newValue);
  }
}

Object.defineProperty(StorageItem, 'EMPTY', {
  writable: false,
  enumerable: false,
  value: Symbol('EMPTY'),
});

export default StorageItem;

