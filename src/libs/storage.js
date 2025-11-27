class StorageInterface {
  #natStorage;

  get length() {
    return this.#natStorage.length;
  }

  constructor(nativeStorage) {
    this.#natStorage = nativeStorage
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
}

const storageInterfaces = new Map([
  [Storage, StorageInterface]
]);

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

  static #collections = new Map();
  static getInstance(nativeStorage) {
    if (!this.#collections.has(nativeStorage)) {
      const StorageInterface = storageInterfaces.get(nativeStorage.constructor);
      const storage = new StorageInterface(nativeStorage);
      const collection = new StorageItemCollection(storage);
      this.#collections.set(nativeStorage, collection);
    }
    return this.#collections.get(nativeStorage);
  }
}



class StorageItem {
  #storage;
  #key;
  #value = StorageItem.EMPTY;
  #defaultValue = StorageItem.EMPTY;

  get value() {
    if (this.#value !== StorageItem.EMPTY) {
      return this.#value;
    }

    if (!this.#storage.has(this.#key)) {
      this.#storage.set(this.#key, this.#defaultValue);
    }

    this.#value = this.#storage.get(this.#key);
    return this.#value;
  }

  set value(value) {
    if (this.#value !== value) {
      this.#storage.set(this.#key, value);
      this.#value = value;
    }
  }

  constructor(nativeStorage, key, defaultValueIfEmpty = StorageItem.EMPTY) {
    const collection = StorageItemCollection.getInstance(nativeStorage);
    if (collection.has(key)) {
      return collection.get(key);
    }
    this.#storage = collection.storage;
    this.#key = key;
    this.#defaultValue = defaultValueIfEmpty;
    collection.set(key, this);
  }

  refresh() {
    this.#value = StorageItem.EMPTY;
  }

  delete() {
    this.#storage.remove(this.#key);
  }
}

Object.defineProperty(StorageItem, 'EMPTY', {
  writable: false,
  enumerable: false,
  value: Symbol('EMPTY'),
});

export default StorageItem ;
