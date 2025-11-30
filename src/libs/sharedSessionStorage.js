const channel = new BroadcastChannel('sharedSessionStorage');

channel.onmessage = (msgEvent) => {
  const { type } = msgEvent.data;
  //console.log('Channel Message received:', type);

  switch (type) {
    case 'sync': {
      channel.postMessage({ type: 'state', storage: JSON.stringify(sessionStorage) });
      break;
    }
    case 'state': {
      const data = JSON.parse(msgEvent.data.storage);
      for (const key in data) {
        sessionStorage.setItem(key, data[key]);
      }
      break;
    }
    case 'set': {
      const { key, value } = msgEvent.data;
      const oldValue = sessionStorage.getItem(key);
      sessionStorage.setItem(key, value);
      triggerStorageEvent(key, value, oldValue);
      break;
    }
    case 'remove': {
      const { key } = msgEvent.data;
      const oldValue = sessionStorage.getItem(key);
      sessionStorage.removeItem(key);
      triggerStorageEvent(key, null, oldValue);
      break;
    }
  }
}

function triggerStorageEvent(key, newValue, oldValue) {
  if (newValue === oldValue) {
    return;
  }
  const e = new StorageEvent('storage', {
    key,
    newValue,
    oldValue,
    storageArea: sessionStorage,
    bubbles: false,
    cancelable: false,
    composed: false,
  });
  window.dispatchEvent(e);
}

const sharedSessionStorage = {
  get length() {
    return sessionStorage.length;
  },

  getItem(key) {
    return sessionStorage.getItem(key);
  },

  setItem(key, value) {
    value = value.toString();
    const oldValue = sessionStorage.getItem(key);
    if (oldValue === value) {
      return;
    }
    sessionStorage.setItem(key, value);
    channel.postMessage({
      type: 'set',
      key,
      value,
    });
  },

  removeItem(key) {
    const value = sessionStorage.getItem(key);
    if (value === null) {
      return;
    }
    sessionStorage.removeItem(key);
    channel.postMessage({
      type: 'remove',
      key,
    });
  },
};

channel.postMessage({ type: 'sync' });
window.sharedSessionStorage = sharedSessionStorage;

export default sharedSessionStorage;