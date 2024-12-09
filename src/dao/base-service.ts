import { templateString } from "../server-utils";
import db from "../services/db";

export interface Model {
    id: string
    created_at: number
    updated_at: number
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

    public async pull(lastPulledAt: number): Promise<Changes<M>> {
        const created = db.fetchAny(templateString(['select * from ' + this.entityName + ' where created_at >= ', '']), lastPulledAt);
        const updated = db.fetchAny(templateString(['select * from ' + this.entityName + ' where created_at < ', ' and updated_at >= ', '']), lastPulledAt, lastPulledAt);
        const deleted = db.fetchAny`select * from deleted_entities where convert(varchar,entity_type) = ${this.entityName} and deleted_at >= ${lastPulledAt}`;

        return Promise.all([created, updated, deleted])
            .then(([created, updated, deleted]) => (
                { created, updated, deleted: deleted.map(row => row['entity_id']) }
            ));
    }


    public async push(lastPulledAt: number, changes: Changes<M>): Promise<boolean> {
        return await db.runInTransaction(async (): Promise<boolean> => {
            return await Promise.all([
                this.create(changes.created),
                this.update(changes.updated),
                this.delete(changes.deleted),
            ]).then(_ => true);
        })
    }

    public async create(entities: Array<M> | undefined) {
        if (!entities || entities.length == 0) return;
        let sanitized = entities.map(this.sanitize).map(this.validate);

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


    public async update(entities: Array<M> | undefined) {
        if (!entities || entities.length == 0) return;
        let sanitized = entities.map(this.sanitize).map(this.validate);

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

    public async delete(ids: Array<string> | undefined) {
        if (!ids || ids.length == 0) return;
        let query = [
            `insert into deleted_entities (entity_type, entity_id, deleted_at) values (`,
            Array(ids.length - 1).fill('), ('),
            `); delete from ${this.entityName} where id in (`,
            ');'
        ].flat();
        let vars = ids.map(id => [this.entityName, id, Date.now()]);
        vars.push(ids);

        let rows = await db.execute(templateString(query), ...vars)
        if (rows < ids.length) {
            throw new Error('Failed to delete row.');
        }
    }
}
