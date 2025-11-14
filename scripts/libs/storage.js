
class Storage {
  static #collection = {};

  static getItem(key, defaultValueIfEmpty) {
    if (!(key in this.#collection)) {
      const localStorageItem = new LocalStorageItem(key, defaultValueIfEmpty);
      this.#collection[key] = localStorageItem;
    }
    return this.#collection[key];
  }
};


class LocalStorageItem {
  #key;
  #value = LocalStorageItem.EMPTY;
  #defaultValue;

  get value() {
    if (this.#value !== LocalStorageItem.EMPTY) {
      return this.#value;
    }

    const item = localStorage.getItem(this.#key);

    if (!item) {
      return this.#defaultValue;
    }

    try {
      return JSON.parse(item)?.v;
    } catch {
      return item;
    }
  }

  set value(v) {
    if (this.#value !== v) {
      localStorage.setItem(this.#key, JSON.stringify({ v }));
      this.#value = v;
    }
  }

  constructor(key, defaultValueIfEmpty = LocalStorageItem.EMPTY) {
    this.#key = key;
    this.#defaultValue = defaultValueIfEmpty;
  }

  refresh() {
    this.#value = LocalStorageItem.EMPTY;
  }

  delete() {
    localStorage.removeItem(this.#key);
  }
}

Object.defineProperty(LocalStorageItem, 'EMPTY', {
  writable: false,
  value: Symbol('EMPTY'),
});

export default Storage;
