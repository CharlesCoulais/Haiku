import NoteListComponent from "./NoteList.component.js";
import htmlToDom from "../utils/htmlToDOM.js";
import template from "./Foldable.template.html";
import { setFocusOnEditor } from "../services/app.state.js";
import unfocusable from "../utils/unfocussable.js";


class FoldableComponent {
  #element = htmlToDom(template);

  constructor() {
    this.#render();
    unfocusable(this.#element);
    this.#element.querySelector('.fold-bt')
      .addEventListener('click', e => this.#switchFold());

    return this.#element;
  }

  #render() {
    this.#element.querySelector('div').replaceChildren(
      new NoteListComponent(),
    );
  }


  #switchFold() {
    this.#element.classList.contains('fold')
      ? this.#element.classList.remove('fold')
      : this.#element.classList.add('fold');
  }
}

export default FoldableComponent;