import { synchronize, SyncPullResult, SyncPushResult } from '@nozbe/watermelondb/sync'
import TableName from './TableName'
import database from './database';

export async function sync() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }): Promise<SyncPullResult> => {
      let response: SyncPullResult = {
        changes: {
          [TableName.Accounts]: {
            created: [],
            updated: [],
            deleted: []
          }
        },
        timestamp: new Date().getTime()
      }
      return response;
    },
    pushChanges: async ({ changes, lastPulledAt }): Promise<SyncPushResult> => {
      let response: SyncPushResult = {}
      return response;
    }
  });
}