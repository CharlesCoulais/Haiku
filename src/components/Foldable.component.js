import NoteListComponent from "./NoteList.component.js";


class FoldableComponent {
  static #tpl = document.getElementById('foldableTpl').content.firstElementChild;
  #element = null;

  constructor() {
    this.#element = FoldableComponent.#tpl.cloneNode(true);
    this.#render();
    this.#element.querySelector('.fold-bt').addEventListener('click', e => this.#switchFold());

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