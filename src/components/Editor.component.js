import { windowHasFocus } from "../observables/WindowFocus.js";
import { currentNote$, focus$, haikuReady$ } from "../services/app.state.js";
import htmlToDom from "../utils/htmlToDOM.js";
import template from "./Editor.template.html";


class EditorComponent {
  #element = htmlToDom(template);
  #noteSub = null;

  constructor() {
    this.#element.querySelector('.page').addEventListener('input', e =>  this.#saveNote());
    currentNote$.subscribe(() => this.openNote());
    this.openNote(currentNote$.value);
    focus$.subscribe(() => this.#focus());    
    return this.#element;
  }

  openNote() {
    const noteModel = currentNote$.value;
    const pageEl = this.#element.querySelector('.page');
    this.#noteSub?.unsubscribe();
    this.#noteSub = null;

    if (!noteModel) {
      pageEl.replaceChildren();
      pageEl.classList.add('unavailable');
      return;
    }
    pageEl.classList.remove('unavailable');
    this.#fullfillContent();

    this.#noteSub = noteModel.subscribe(e => this.#refresh(e));

    haikuReady$.subscribe(() => this.#focus());
    this.#setCaretAtTheEnd(pageEl);
  }

  #focus() {
    const pageEl = this.#element.querySelector('.page');
    pageEl.focus();
    const range = document.createRange();
    range.selectNodeContents(pageEl);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  #hasFocus() {
    const pageEl = this.#element.querySelector('.page');
    return document.activeElement === pageEl;
  }

  #fullfillContent() {
    const noteModel = currentNote$.value;
    const pageEl = this.#element.querySelector('.page');
    pageEl.replaceChildren(noteModel ? this.#textToNodeTree(noteModel.content) : null);
    this.#formatHtmlText();
  }

  #refresh({ type }) {
    if (!windowHasFocus() && type === 'change') {
      this.#fullfillContent();
      if (this.#hasFocus()) {
        this.#focus();
      }
    }
  }

  #formatHtmlText() {
    const pageEl = this.#element.querySelector('.page');
    const nodeIterator = document.createNodeIterator(
      pageEl,
      NodeFilter.SHOW_ELEMENT,
      el => el !== pageEl
        && el.nodeName.toLowerCase() === 'div'
        && !!el.textContent.trim()
    );
    let el;
    
    while (el = nodeIterator.nextNode()) {
      el.className = 'text';
      el.removeAttribute('style');
    }
    pageEl.querySelector('div.text')?.classList?.add('title');
  }

  #saveNote() {
    this.#formatHtmlText();
    const textContent = this.#nodeTreeToText();
    currentNote$.value.content = textContent;
  }
  
  #textToNodeTree(text = '') {
    const temp = document.createElement('template');
    let hasTitle = false;

    temp.innerHTML = text.split(/\r\n/)
      .map(t => {
        if (!t) {
          return '<div class="br"><br/></div>';
        }
        if (!hasTitle && !!t.trim().length) {
          hasTitle = true;
          return `<div class="text title">${t}</div>`
        }
        return `<div class="text">${t}</div>`
      })
      .join('');

    return temp.content;
  }
  
  #nodeTreeToText() {
    const pageEl = this.#element.querySelector('.page');
    const clone = pageEl.cloneNode(true);
    clone.querySelectorAll('div').forEach((node, i) => {
      node.parentNode.insertBefore(document.createTextNode('\r\n'), node);
    });

    return clone.textContent.replace(/^\r\n/, '');
  }

  #setCaretAtTheEnd(pageEl) {
    const range = document.createRange();
    range.selectNodeContents(pageEl);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}


export default EditorComponent;