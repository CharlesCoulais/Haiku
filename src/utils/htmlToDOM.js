export default function htmlToDom(tplStr) {
  const tplEl = document.createElement('template');
  tplEl.innerHTML = tplStr;
  return tplEl.content.firstElementChild;
}