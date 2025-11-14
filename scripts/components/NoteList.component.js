import NoteCollectionModel from "../models/NoteCollection.model.js";
import NoteItemComponent from "./NoteItem.component.js";
import { currentNote$ } from "../app.state.js";



class NoteListComponent {
  static #tpl = document.getElementById('noteListTpl').content.firstElementChild;

  #collectionModel$ = NoteCollectionModel.getInstance();
  #element = null;

  constructor() {
    this.#element = NoteListComponent.#tpl.cloneNode(true);
    this.#render();
    this.#setEventListeners();

    this.#collectionModel$.subscribe(({ type, noteId }) => {
      switch (type) {
        case 'create':
          this.#createNewNote(noteId);
          break;
        case 'change':
          this.#putNoteOnTop(noteId);
          break;
      }
    });

    currentNote$.subscribe(noteModel => {
      if (!noteModel) {
        this.#createNewNote(null);
      }
    });

    if (!currentNote$.value) {
      this.#createNewNote(null);
    }

    return this.#element;
  }

  #render() {
    const listEl = this.#element.querySelector('.note-list');
    const noteEls = this.#collectionModel$.map((noteId, i) => new NoteItemComponent(noteId));
    listEl.replaceChildren(...noteEls);
  }

  #setEventListeners() {
    this.#element.querySelector('#newNoteBt').addEventListener('click', e => this.#createNewNote(null));
  }

  #putNoteOnTop(noteId) {
    const itemEl = document.getElementById('noteItem-' + noteId);
    this.#insertOnTop(itemEl);
  }

  #createNewNote(noteId) {
    if (noteId === currentNote$.value?.id) {
      // if current selected note has the same id,
      // the note component element already exist and
      // was a temporary transformed in regular note. So, exit.
      return;
    }
    const itemEl = new NoteItemComponent(noteId);
    this.#insertOnTop(itemEl);
  }

  #insertOnTop(itemEl) {
    if (!itemEl) {
      return;
    }
    const listEl = this.#element.querySelector('.note-list');
    const hasTempItem = !!listEl.querySelector('.note-item.temp');
    const beforeItemEl = listEl.children[ hasTempItem ? 1 : 0 ];
    listEl.insertBefore(itemEl, beforeItemEl);
  }
}


export default NoteListComponent;