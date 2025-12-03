export default function unfocusable(el) {
  const listener = e => e.preventDefault();
  el.addEventListener('mousedown', listener);
  return () => el.removeEventListener('mousedown', listener);
}