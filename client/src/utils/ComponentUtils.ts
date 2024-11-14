import { Subscription } from "rxjs";

export function unsubscribeAll(...subscriptions: Subscription[]): () => void {
  return () =>
    subscriptions.forEach(subscription => {
      try {
        subscription.unsubscribe();
      } catch { /* empty */ }
    });
}