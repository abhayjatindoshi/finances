import { synchronize, SyncPullArgs, SyncPullResult, SyncPushResult } from '@nozbe/watermelondb/sync'
import TableName from './TableName'
import database from './database';

export async function sync() {
  await synchronize({
    database,
    pullChanges: async (args): Promise<SyncPullResult> => {
      let urlParams = new URLSearchParams(args as any).toString();
      let response = await fetch(`/api/v1/sync/pull?${urlParams}`, { method: 'POST' })
        .then(res => res.json()) as SyncPullResult;
      return response;
    },
    pushChanges: async ({ changes, lastPulledAt }): Promise<SyncPushResult> => {
      let response: SyncPushResult = {}
      return response;
    }
  });
}