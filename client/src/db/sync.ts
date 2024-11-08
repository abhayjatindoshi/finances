import { synchronize, SyncPullArgs, SyncPullResult, SyncPushResult } from '@nozbe/watermelondb/sync'
import database from './database';

export async function sync() {
  await synchronize({
    database,
    pullChanges: async (args: SyncPullArgs): Promise<SyncPullResult> => {
      let urlParams = new URLSearchParams(args as any).toString();
      let response = await fetch(`/api/v1/sync/pull?${urlParams}`, { method: 'POST' })
        .then(res => res.json()) as SyncPullResult;
      return response;
    },
    pushChanges: async ({ changes, lastPulledAt }): Promise<SyncPushResult> => {
      let response = await fetch(`/api/v1/sync/push?lastPulledAt=${lastPulledAt}`, {
        method: 'POST',
        body: JSON.stringify(changes)
      }).then(res => res.json()) as SyncPushResult;
      return response;
    }
  });
}