import { Subject } from "shibirx";
import LoadedState$ from "../observables/LoadedState.js";
import NoteCollectionCursor$ from "../observables/NoteCollectionCursor.js";


const haikuReady$ = new LoadedState$();
const currentNote$ = new NoteCollectionCursor$();
const focus$ = new Subject();
const setFocusOnEditor = () => focus$.next();

const appState = {
  haikuReady$,
  currentNote$,
};

export { haikuReady$, currentNote$, focus$, setFocusOnEditor };
export default appState;