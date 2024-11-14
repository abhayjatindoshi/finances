import { synchronize, SyncPullArgs, SyncPullResult, SyncPushResult } from '@nozbe/watermelondb/sync'
import database from './database';

let isRunning = false;

export async function sync() {
  if (isRunning) return;
  await synchronize({
    database,
    pullChanges: async (args: SyncPullArgs): Promise<SyncPullResult> => {
      if (isRunning) throw new Error('Sync already in progress');
      isRunning = true;
      const urlParams = new URLSearchParams({
        lastPulledAt: args.lastPulledAt?.toString() || '',
        schemaVersion: args.schemaVersion.toString(),
        migration: JSON.stringify(args.migration)
      }).toString();
      const response = await fetch(`/api/v1/sync/pull?${urlParams}`, { method: 'POST' })
        .then(res => res.json()) as SyncPullResult;
      isRunning = false;
      return response;
    },
    pushChanges: async ({ changes, lastPulledAt }): Promise<SyncPushResult> => {
      if (isRunning) throw new Error('Sync already in progress');
      isRunning = true;
      const response = await fetch(`/api/v1/sync/push?lastPulledAt=${lastPulledAt}`, {
        method: 'POST',
        body: JSON.stringify(changes),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()) as SyncPushResult;
      isRunning = false;
      return response;
    }
  });
}