import NoteCollectionModel from "../models/NoteCollection.model.js";
import NoteItemComponent from "./NoteItem.component.js";
import { currentNote$ } from "../services/app.state.js";
import htmlToDom from "../utils/htmlToDOM.js";
import template from  "./NoteList.template.html";
import unfocusable from "../utils/unfocussable.js";



class NoteListComponent {
  #element = htmlToDom(template);
  #collectionModel$ = NoteCollectionModel.getInstance();

  constructor() {
    this.#render();
    this.#setEventListeners();

    this.#collectionModel$.subscribe(({ type, noteId }) => {
      switch (type) {
        case 'note:create':
          this.#createNewNote(noteId);
          break;
        case 'note:change':
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
    const noteEls = this.#collectionModel$.map(noteId => new NoteItemComponent(noteId));
    listEl.replaceChildren(...noteEls);
  }

  #setEventListeners() {
    const newNoteBtEl = this.#element.querySelector('#newNoteBt');
    unfocusable(newNoteBtEl);
    newNoteBtEl.addEventListener('click', e => {
      e.preventDefault();
      this.#createNewNote(null);
    });
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