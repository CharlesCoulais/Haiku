import NoteModel from "../models/Note.model.js";
import { currentNote$ } from "../app.state.js";


class NoteItemComponent {
  static #tpl = document.getElementById('noteItemTpl').content.querySelector('.note-item');
  #noteModel$ = null;
  #element = NoteItemComponent.#tpl.cloneNode(true);
  #currentSub = null;

  constructor(noteId) {
    this.#noteModel$ = NoteModel.getInstance(noteId);
    this.#noteModel$.subscribe(({ type } )=> {
      switch (type) {
        case 'refresh':
        case 'change':
          this.#render();
          break;
        case 'delete':
          this.#remove();
          break;
      }
    });
    this.#render();
    this.#setEventListeners();


    if (noteId === null) {
      currentNote$.set(this.#noteModel$);
    }

    this.#currentSub = currentNote$.subscribe(currentModel => {
      if (currentModel === this.#noteModel$) {
        this.#select();
      } else {
        this.#unselect();
      }
    });

    if (currentNote$.value === this.#noteModel$) {
      this.#select();
    }

    return this.#element;
  }

  #render() {
    if (this.#noteModel$.id) {
      this.#element.setAttribute('id', 'noteItem-' + this.#noteModel$.id);
      this.#element.classList.remove('temp');
    } else {
      this.#element.classList.add('temp');
    }
    const { title } = this.#noteModel$;

    if (title) {
      this.#element.classList.remove('empty');
    } else {
      this.#element.classList.add('empty');
    }

    this.#element.querySelector('.note-title').textContent = title || (this.#noteModel$.isSaved ? '(vide)' : '(Nouvelle note)');
    this.#element.querySelector('.note-modified-date').textContent = this.#noteModel$.modified;

    return this.#element ;
  }

  #setEventListeners() {
    this.#element.addEventListener('click', e =>  currentNote$.set(this.#noteModel$));
    this.#element.querySelector('.note-delete-bt').addEventListener('click', e => {
      e.stopPropagation();
      this.#noteModel$.delete();
    });
  }

  #select() {
    this.#element.classList.add('current');
  }

  #unselect() {
    this.#element.classList.remove('current');
    if (!this.#noteModel$.isSaved) {
      this.#noteModel$.delete();
    }
  }

  #remove() {
    this.#element.parentNode?.removeChild(this.#element);
    this.#currentSub.unsubscribe();
  }
}


export default NoteItemComponent;