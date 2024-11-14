import { BehaviorSubject, Subscription } from "rxjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const variables = new Map<string, BehaviorSubject<any>>();

export function createGlobalVariable<T>(name: string, initialValue?: T | undefined): BehaviorSubject<T> {
  if (!variables.has(name)) {
    const subject = new BehaviorSubject(initialValue);
    variables.set(name, subject);
  }
  return variables.get(name)!;
}

export function subscribeTo<T>(name: string, callback: (value: T) => void): Subscription {
  if (!variables.has(name)) {
    return new Subscription();
  }
  return variables.get(name)!.subscribe(callback);
}