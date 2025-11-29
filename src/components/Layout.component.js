import BodyComponent from "./Body.component.js";
import HeaderComponent from "./Header.component.js";
import htmlToDom from "../utils/htmlToDOM.js";
import template from  "./Layout.template.html";


class LayoutComponent {
  #element = htmlToDom(template);

  constructor() {
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