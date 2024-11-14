import { BehaviorSubject, Subscription } from "rxjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const variables = new Map<string, BehaviorSubject<any>>();

export function createGlobalVariable<T>(name: string, initialValue?: T | undefined): BehaviorSubject<T> {
  let subject = variables.get(name)
  if (!subject) {
    subject = new BehaviorSubject(initialValue);
    variables.set(name, subject);
  }
  return subject;
}

export function subscribeTo<T>(name: string, callback: (value: T) => void): Subscription {
  const subject = variables.get(name);
  if (!subject) {
    return new Subscription();
  }
  return subject.subscribe(callback);
}