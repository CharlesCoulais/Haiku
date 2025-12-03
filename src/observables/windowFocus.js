import { Observable, Subject } from "shibirx";


const hasFocus$ = new Subject(document.hasFocus());
window.addEventListener('focus', () => hasFocus$.next(true));
window.addEventListener('blur', () => hasFocus$.next(false));
const windowFocus$ = new Observable(subscriber => {
  const subscription = hasFocus$.subscribe(subscriber);
  subscriber.next(hasFocus$.value);
  return () => subscription.unsubscribe();
});

function windowHasFocus() {
  return hasFocus$.value;
};


export { windowHasFocus };
export default windowFocus$;