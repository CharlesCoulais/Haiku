import EditorComponent from "./Editor.component.js";
import FoldableComponent from "./Foldable.component.js";


class BodyComponent {
  static #tpl = document.getElementById('bodyTpl').content.firstElementChild;
  #element = null;

  constructor() {
    this.#element = BodyComponent.#tpl.cloneNode(true);
    
    this.#element.querySelector('.body-wrapper').replaceChildren(
      new FoldableComponent(),
      new EditorComponent(),
    );

    return this.#element;
  }
}

export default BodyComponent;