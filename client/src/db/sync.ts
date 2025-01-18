import { synchronize, SyncPullArgs, SyncPullResult, SyncPushResult } from '@nozbe/watermelondb/sync'
import database from './database';
import { syncTimeout } from '../constants';
import { sleep } from '../utils/Common';
import { createGlobalVariable } from '../utils/GlobalVariable';

export interface SyncArgs {
  replacement: boolean
}

async function sync(syncArgs: SyncArgs = { replacement: false }): Promise<void> {
  const db = database();
  await synchronize({
    database: db,
    pullChanges: async (args: SyncPullArgs): Promise<SyncPullResult> => {
      const urlParams = new URLSearchParams({
        lastPulledAt: args.lastPulledAt?.toString() || '',
        schemaVersion: args.schemaVersion.toString(),
        migration: JSON.stringify(args.migration),
        replacement: syncArgs.replacement.toString(),
      }).toString();
      const response = await fetch(`/api/v1/sync/pull?${urlParams}`, { method: 'POST', headers: { 'tenant-id': db.adapter.dbName ?? '' } })
        .then(res => res.json()) as SyncPullResult;
      return response;
    },
    pushChanges: async ({ changes, lastPulledAt }): Promise<SyncPushResult> => {
      const request = fetch(`/api/v1/sync/push?lastPulledAt=${lastPulledAt}`, {
        method: 'POST',
        body: JSON.stringify(changes),
        headers: {
          'Content-Type': 'application/json',
          'tenant-id': db.adapter.dbName ?? '',
        }
      })
      request.catch(err => {
        throw new Error(`Error pushing changes: ${err}`);
      })
      const response = await request.then(res => res.json()) as SyncPushResult;
      return response;
    }
  });
}

const awaitingExecution: Array<{ args: SyncArgs, resolve: () => void }> = [];
const waitingForNextSync: Array<() => void> = [];
const syncing = createGlobalVariable<boolean>('syncing', false);

export async function syncNow(replace: boolean): Promise<void> {
  return new Promise<void>(resolve => {
    awaitingExecution.push({ args: { replacement: replace }, resolve });
  });
}

export async function waitForNextSync(): Promise<void> {
  return new Promise<void>(resolve => {
    waitingForNextSync.push(resolve);
  });
}

export async function syncLoop() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (awaitingExecution.length > 0) {
      while (awaitingExecution.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { args, resolve } = awaitingExecution.pop()!;
        syncing.next(true);
        await sync(args);
        syncing.next(false);
        resolve();
        waitingForNextSync.forEach(f => f());
        waitingForNextSync.splice(0, waitingForNextSync.length);
      }
    } else {
      syncing.next(true);
      await sync();
      syncing.next(false);
      waitingForNextSync.forEach(f => f());
      waitingForNextSync.splice(0, waitingForNextSync.length);
    }

    await sleep(syncTimeout)
  }
}