import { templateString } from "../server-utils";
import db from "../services/db";

export interface Model {
    id: string
    created_at: number
    updated_at: number
    tenant_id: string
}

export interface Changes<M extends Model> {
    created: Array<M>,
    updated: Array<M>,
    deleted: Array<string>
}

export type ChangeSet = {
    [name: string]: Changes<Model>
}

export default abstract class BaseService<M extends Model> {
    abstract entityName: string;
    abstract sanitize(entity: M): M;
    abstract validate(entity: M): M;

    public async pull(tenantId: string, lastPulledAt: number): Promise<Changes<M>> {
        const created = db.fetchAny(templateString(['select * from ' + this.entityName + ' where tenant_id = ', ' and created_at >= ', '']), tenantId, lastPulledAt);
        const updated = db.fetchAny(templateString(['select * from ' + this.entityName + ' where tenant_id = ', ' and created_at < ', ' and updated_at >= ', '']), tenantId, lastPulledAt, lastPulledAt);
        const deleted = db.fetchAny`select * from deleted_entities where tenant_id = ${tenantId} and convert(varchar,entity_type) = ${this.entityName} and deleted_at >= ${lastPulledAt}`;

        return Promise.all([created, updated, deleted])
            .then(([created, updated, deleted]) => (
                { created, updated, deleted: deleted.map(row => row['entity_id']) }
            ));
    }


    public async push(tenantId: string, lastPulledAt: number, changes: Changes<M>): Promise<boolean> {
        return await db.runInTransaction(async (): Promise<boolean> => {
            return await Promise.all([
                ...this.chunckAndExecute(100, changes.created, items => this.create(tenantId, items)),
                ...this.chunckAndExecute(100, changes.updated, items => this.update(tenantId, items)),
                ...this.chunckAndExecute(100, changes.deleted, items => this.delete(tenantId, items)),
            ]).then(_ => true);
        })
    }

    private chunckAndExecute<T, V>(chunkSize: number, items: Array<T>, executor: (items: Array<T>) => Promise<V>): Array<Promise<V>> {
        let promises = [];
        for (let i = 0; i < items.length; i += chunkSize) {
            promises.push(executor.call(this, items.slice(i, i + chunkSize)));
        }
        return promises;
    }

    public async create(tenantId: string, entities: Array<M> | undefined) {
        if (!entities || entities.length == 0) return;
        let sanitized = entities.map(this.sanitize).map(this.validate);
        sanitized.forEach(e => e.tenant_id = tenantId);

        let keys = Object.keys(sanitized[0]);
        let vars = sanitized.map(entity => keys.map(key => (entity as any)[key]));
        let query = [
            `insert into ${this.entityName} (${keys.join(', ')}) values (`,
            Array(vars.length - 1).fill('), ('),
            ')'
        ].flat();

        let rows = await db.execute(templateString(query), ...vars)
        if (rows != sanitized.length) {
            throw new Error('Failed to insert row.');
        }
    }


    public async update(tenantId: string, entities: Array<M> | undefined) {
        if (!entities || entities.length == 0) return;
        let sanitized = entities.map(this.sanitize).map(this.validate);
        sanitized.forEach(e => e.tenant_id = tenantId);

        let keys = Object.keys(sanitized[0]);
        let vars = sanitized.map(entity => [...keys.map(key => (entity as any)[key]), entity.id]).flat();
        let query = entities.map(_ => `update ${this.entityName} 
            set ${keys.map(key => `${key} = ?`).join(', ')} where id = ?;`)
            .join(' ').split('?');

        let rows = await db.execute(templateString(query), ...vars)
        if (rows != sanitized.length) {
            throw new Error('Failed to update row.');
        }
    }

    public async delete(tenantId: string, ids: Array<string> | undefined) {
        if (!ids || ids.length == 0) return;
        let query = [
            `insert into deleted_entities (tenant_id, entity_type, entity_id, deleted_at) values (`,
            Array(ids.length - 1).fill('), ('),
            `); delete from ${this.entityName} where id in (`,
            ') and tenant_id = ',
            ';'
        ].flat();
        let vars = ids.map(id => [tenantId, this.entityName, id, Date.now()]);
        vars.push(ids);

        let rows = await db.execute(templateString(query), ...vars, tenantId)
        if (rows < ids.length) {
            throw new Error('Failed to delete row.');
        }
    }
}
