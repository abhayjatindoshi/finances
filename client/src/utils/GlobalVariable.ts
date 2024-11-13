import { BehaviorSubject, Subscription } from "rxjs";

const variables = new Map<string, BehaviorSubject<any>>();

export function createGlobalVariable<T>(name: string, initialValue?: T | undefined): BehaviorSubject<T> {
  if (!variables.has(name)) {
    let subject = new BehaviorSubject(initialValue);
    variables.set(name, subject);
  }
  return variables.get(name)!;
}

export function subscribeTo<T>(name: string, callback: (value: T) => void): Subscription {
  if (!variables.has(name)) {
    throw new Error(`Variable with name ${name} does not exist`);
  }
  return variables.get(name)!.subscribe(callback);
}