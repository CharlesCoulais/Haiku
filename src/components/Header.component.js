import { currentNote$ } from "../app.state.js";


class HeaderComponent {
  static #tpl = document.getElementById('headerTpl').content.firstElementChild;
  #element = null;
  #objectUrl = null;

  constructor() {
    this.#element = HeaderComponent.#tpl.cloneNode(true);
    this.#setEventListeners();
    return this.#element;
  }

  #setEventListeners() {
    this.#element.querySelector('.fullscreen-bt').addEventListener('click', e => this.#fullscreen());
    this.#element.querySelector('.print-bt').addEventListener('click', e => window.print());
    this.#element.querySelector('.download-bt').addEventListener('click', e => this.#downloadNote());
  }

  #fullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    } else {
      document.querySelector('.layout').requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    }
  }

  #downloadNote() {
    const link = document.createElement('a');
    const filename = currentNote$.value.title.substring(0, 24);
    link.setAttribute('download', `${filename}.haiku.md`);
    link.href = this.#createObjectUrl();
    const event = new MouseEvent('click');
    link.dispatchEvent(event);
  }

  #createObjectUrl() {
    if (this.#objectUrl !== null) {
      window.URL.revokeObjectURL(this.#objectUrl);
    }
    const content = currentNote$.value.content;
    const blob = new Blob([ content ], { type: 'text/markdown' });
    this.#objectUrl = window.URL.createObjectURL(blob);
    return this.#objectUrl;
  }
}

export default HeaderComponent;