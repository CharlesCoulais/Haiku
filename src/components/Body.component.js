import EditorComponent from "./Editor.component.js";
import FoldableComponent from "./Foldable.component.js";
import htmlToDom from "../utils/htmlToDOM.js";
import template from  "./Body.template.html";

class BodyComponent {
  #element = htmlToDom(template);

  constructor() {
    this.#element.querySelector('.body-wrapper').replaceChildren(
      new FoldableComponent(),
      new EditorComponent(),
    );

    return this.#element;
  }
}

export default BodyComponent;