import { Subject } from "shibirx";


class LoadedState$ extends Subject {
  #isReady = false;

  next() {
    super.next(true);
    super.complete();
  }

  subscribe(arg) {
    if (!this.#isReady) {
      return super.subscribe(arg);
    }
    const subject$ = new Subject();
    const subscription = subject$.subscribe(arg);
    subject$.next(true);
    subject$.complete();
    return subscription;
  }
}

export default LoadedState$;