class Subject {
  #subscribers = new SubscriberCollection();
  #value;

  get value() {
    return this.#value;
  }

  constructor(initialValue) {
    this.#value = initialValue;
  }

  set(newValue) {
    this.#value = newValue;
    this.#subscribers.emit(newValue);
  }

  subscribe(subscriber) {
    const subscription = this.#subscribers.subscribe(subscriber);
    subscriber(this.#value);
    return subscription;
  }
}

class SwitchSubject {
  #subscribers = new SubscriberCollection();
  #value;

  get value() {
    return this.#value;
  }

  constructor(initValue) {
    this.#value = !! initValue;
  }

  turnOn() {
    if (!this.#value) {
      this.#subscribers.emit(true);
      this.#value = true;
    }
  }

  turnOff() {
    if (this.#value) {
      this.#subscribers.emit(false);
      this.#value = false;
    }
  }

  subscribe(subscriber) {
    return this.#subscribers.subscribe(subscriber);
  }
}


class FocusSubject {
  #activeValue$ = new Subject(null);
  #blur$ = new SwitchSubject(false);

  get value() {
    return this.#activeValue$.value;
  }

  constructor(value) {
    this.#activeValue$.set(value);
  }

  set(value) {
    if (value === this.#activeValue$.value) {
      return;
    }
    this.#blur$.turnOn();
    this.#activeValue$.set(value);
    this.#blur$ = new SwitchSubject();
    return this.#blur$;
  }

  subscribe(callback) {
    return this.#activeValue$.subscribe(callback);
  }
}

class SubscriberCollection {
  #subscribers = [];
  #subscriptions = [];
  #emitStack = new CallStack();

  subscribe(subscriber) {
    this.#subscribers.push(subscriber);
    const sub = new Subscription(() => this.unsubscribe(subscriber));
    this.#subscriptions.push(sub);
    return sub;
  }

  emit(...values) {
    this.#emitStack.exec(() => this.#subscribers?.forEach(subscriber => subscriber(...values)));
  }

  unsubscribe(subscriber) {
    this.#subscribers = this.#subscribers?.filter(sub => sub !== subscriber) || null;
  }

  destroy() {
    this.#subscribers = null;
    this.#subscriptions.forEach(sub => sub.unsubscribe());
    this.#subscriptions = null;
  }
}

class Subscription {
  #unsubscribeFn;

  constructor(unsubscribeFn) {
    this.#unsubscribeFn = unsubscribeFn;
  }

  unsubscribe() {
    this.#unsubscribeFn?.();
  }
}

class CallStack {
  #stack = [];
  #executing = false;

  constructor() {

  }

  exec(fn) {
    this.#stack.push(fn);
    if (this.#executing) {
      return;
    }

    this.#executing = true;
    while (this.#stack.length) {
      const fn = this.#stack.shift();
      fn();
    }
    this.#executing = false;
  }
}


export {
  Subject,
  FocusSubject,
  SwitchSubject,
  SubscriberCollection,
};

