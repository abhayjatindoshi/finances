import { synchronize, SyncPullArgs, SyncPullResult, SyncPushArgs, SyncPushResult } from "@nozbe/watermelondb/sync";
import { syncTimeout } from "../constants";
import database, { allTenantIds } from "./database";
import { createGlobalVariable } from "../utils/GlobalVariable";

export interface SyncArgs {
  replacement: boolean;
}

interface QueueItem {
  tenantId: string,
  args?: SyncArgs,
  resolve: () => void;
  reject: (reason?: unknown) => void;
}

class SyncManager {
  private interval: number;
  private currentlySyncing: string | null;
  private queue: Array<QueueItem> = [];
  private syncSubject = createGlobalVariable<boolean>('syncing');

  constructor(interval: number) {
    this.interval = interval;
    this.currentlySyncing = null;
  }

  public async sync(tenantId: string, args?: SyncArgs): Promise<void> {
    return this.enqueue(tenantId, args);
  }

  public async startAutoSync(): Promise<void> {
    setInterval(() => {
      allTenantIds().forEach(t => this.enqueue(t));
      this.processQueue();
    }, this.interval);
  }

  private async enqueue(tenantId: string, args?: SyncArgs): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.queue.push({ tenantId, args, resolve, reject });
      this.processQueue();
    })
  }

  private async processQueue(): Promise<void> {
    if (this.currentlySyncing || this.queue.length === 0) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { tenantId, args, resolve, reject } = this.queue.shift()!;
    this.currentlySyncing = tenantId;
    this.syncSubject.next(true);
    try {
      await this._sync(tenantId, args);
      resolve();
    } catch (e: unknown) {
      reject(e);
    } finally {
      this.currentlySyncing = null;
      this.syncSubject.next(false);
      this.processQueue();
    }
  }

  private async _sync(tenantId: string, args: SyncArgs = { replacement: false }): Promise<void> {
    return await synchronize({
      database: database(tenantId),
      pullChanges: this.pullChanges(tenantId, args),
      pushChanges: this.pushChanges(tenantId, args),
    })
  }

  private pullChanges(tenantId: string, syncArgs: SyncArgs): (args: SyncPullArgs) => Promise<SyncPullResult> {
    return async (args: SyncPullArgs): Promise<SyncPullResult> => {
      const urlParams = new URLSearchParams({
        lastPulledAt: args.lastPulledAt?.toString() || '',
        schemaVersion: args.schemaVersion.toString(),
        migration: JSON.stringify(args.migration),
        replacement: syncArgs.replacement.toString(),
      }).toString();
      const response = await fetch(`/api/v1/sync/pull?${urlParams}`, {
        method: 'POST',
        headers: {
          'tenant-id': tenantId
        }
      }).then(res => res.json()) as SyncPullResult;
      return response;
    }
  }

  private pushChanges(tenantId: string, syncArgs: SyncArgs): (args: SyncPushArgs) => Promise<SyncPushResult> {
    return async (args: SyncPushArgs): Promise<SyncPushResult> => {
      const request = fetch(`/api/v1/sync/push?lastPulledAt=${args.lastPulledAt}`, {
        method: 'POST',
        body: JSON.stringify(args.changes),
        headers: {
          'Content-Type': 'application/json',
          'tenant-id': tenantId,
        }
      })
      request.catch(err => {
        throw new Error(`Error pushing changes: ${err}`);
      })
      const response = await request.then(res => res.json()) as SyncPushResult;
      return response;
    }
  }
}

const syncManager = new SyncManager(syncTimeout);
export default syncManager;