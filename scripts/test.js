'use strict';

import taos from './Taos.js';

// minimal case to proxy error
function testError() {
  const proxy = new Proxy({ value: 0 }, {
    set(target, key, value) {
      target[key] = value;
      //Reflect.set(...arguments);
    },
  });

  // Fail only in Strict Mode
  try {
    proxy.value = 42;
    console.log('Test 1 succeed');
  } catch(e) {
    console.error('Test 1 failed');
    console.error(e);
  }


  // Fail even without Strict Mode
  class TestClass {

    constructor() {
      try {
        proxy.value = 42;
        console.log('Test 2 succeed');
      } catch(e) {
        console.error('Test 2 failed');
        console.error(e);
      }
    }
  }
  new TestClass();
}

testError();


window.$ = taos;

function createSelectorProxy(rootEL, trakers = {}) {
  return new Proxy({}, {

    get(context, key) {
      if (context[key]) {
        return createElementAttributeProxy(context[key], trakers, [key]);
      }
      if (key === ':root') {
        return createElementAttributeProxy(rootEL, trakers, [key]);
      }
      if (key.startsWith('$')) {
        return Array.from(rootEL.querySelectorAll(key.replace(/^\$/, '')))
          .map(el => createElementAttributeProxy(el, trakers, [key]));
      }
      //throw new Error('SelectorProxy attributes cannot be set');
      const el = rootEL.querySelector(key);
      return el ? createElementAttributeProxy(el, trakers, [key]) : el;
    },

    set(context, key, value) {
      const elList = Array.from(rootEL.querySelectorAll(key.replace(/^\$/, '')))
      if (typeof value === 'string') {
        const tpl = document.createElement('template');
        tplEl.innerHTML = value;
        elList.forEach(el => el.replaceWith(tpl.content.cloneNode(true)));
      } else if (value instanceof Element || value instanceof DocumentFragment) {
        elList.forEach(el => el.replaceWith(value));
      }
      throw new Error('SelectorProxy attributes cannot be set');
    },
  });
}

function createElementAttributeProxy(el, trackers = {}, path = []) {
  return new Proxy({}, {

    get(context, key) {
      if (typeof el[key] === 'function') {
        throw new Error(`ElementAttributesProxy cannot get element methods like 'Element::${key}()'`);
      }
      if (key === 'dataset') {
        return createElementDatasetProxy(el, trackers, path);
      }
      if (typeof el[key] === 'object') {
        throw new Error(`ElementAttributesProxy cannot get element attribute as object like 'Element::${key}'`);
      }
      trakers?.onGet?.([...path, key]);
      return el[key] || el.getAttribute(key);
    },

    set(context, key, value) {
      if (typeof el[key] === 'function') {
        throw new Error(`ElementAttributesProxy cannot set element methods like 'Element::${key}()'`);
      }
      if (typeof el[key] === 'object') {
        throw new Error(`ElementAttributesProxy cannot set element attribute as object like 'Element::${key}'`);
      }
      trakers?.onSet?.([...path, key]);
      el.setAttribute(key, value);
    },
  });
}

function createElementDatasetProxy(el, trakers = {}, path = []) {
  return new Proxy({}, {

    get(context, key) {
      trakers?.onGet?.([...path, key]);
      return el.dataset[key];
    },

    set(context, key, value) {
      trakers?.onSet?.([...path, key]);
      el.dataset[key] = value;
    },
  });
}