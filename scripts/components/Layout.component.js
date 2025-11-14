import BodyComponent from "./Body.component.js";
import HeaderComponent from "./Header.component.js";


class LayoutComponent {
  static #tpl = document.getElementById('layoutTpl').content.firstElementChild;
  #element = null;

  constructor() {
    this.#element = LayoutComponent.#tpl.cloneNode(true);
    this.#render();
    this.#setEventListeners();

    return this.#element;
  }

  #render() {
    this.#element.replaceChildren(
      new HeaderComponent(),
      new BodyComponent(),
    );
  }

  #setEventListeners() {
    this.#element.addEventListener('fullscreenchange', e => this.#onFullscreenChange());
  }

  #onFullscreenChange() {
    if (document.fullscreenElement) {
      this.#element.classList.add('fullscreen');
    } else {
      this.#element.classList.remove('fullscreen');
    }
  }
}


export default LayoutComponent;