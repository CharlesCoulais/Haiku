const sharedItems = new Set();
const channel = new BroadcastChannel('sharedSessionStorage');


channel.onmessage = (msgEvent) => {
  const { type } = msgEvent.data;
  //console.log('Channel Message received:', type, msgEvent.data);

  switch (type) {
    case 'sync': {
      const data = {};
      for (const key of sharedItems) {
        data[key] = sessionStorage.getItem(key);
      }
      channel.postMessage({ type: 'state', storageData: JSON.stringify(data) });
      break;
    }
    case 'state': {
      const data = JSON.parse(msgEvent.data.storageData);
      for (const key in data) {
        sharedItems.add(key);
        sessionStorage.setItem(key, data[key]);
      }
      break;
    }
    case 'set': {
      const { key, value } = msgEvent.data;
      const oldValue = sessionStorage.getItem(key);
      sessionStorage.setItem(key, value);
      sharedItems.add(key);
      triggerStorageEvent(key, value, oldValue);
      break;
    }
    case 'remove': {
      const { key } = msgEvent.data;
      const oldValue = sessionStorage.getItem(key);
      sessionStorage.removeItem(key);
      sharedItems.delete(key);
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
    return sharedItems.size;
  },

  getItem(key) {
    if (!sharedItems.has(key)) {
      return null;
    }
    return sessionStorage.getItem(key);
  },

  setItem(key, value) {
    const oldValue = sessionStorage.getItem(key);
    if (sharedItems.has(key) && oldValue === value.toString()) {
      return;
    }
    sessionStorage.setItem(key, value.toString());
    sharedItems.add(key);
    channel.postMessage({
      type: 'set',
      key,
      value,
    });
  },

  removeItem(key) {
    if (!sharedItems.has(key)) {
      return;
    }
    sessionStorage.removeItem(key);
    sharedItems.delete(key);
    channel.postMessage({
      type: 'remove',
      key,
    });
  },
};

channel.postMessage({ type: 'sync' });
window.sharedSessionStorage = sharedSessionStorage;

export default sharedSessionStorage;