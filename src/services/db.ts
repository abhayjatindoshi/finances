import { ConnectionPool, IResult } from 'mssql';

class Db {
    pool: Promise<ConnectionPool>;

    constructor(connectionString: string | undefined) {
        if (!connectionString) {
            throw new Error('Invalid connection string.');
        }

        this.pool = new ConnectionPool(connectionString)
            .connect()
            .then(pool => {
                console.log('Connection to db successful.')
                return pool;
            })
            .catch(err => {
                throw new Error('Failed to connect to db: ' + err);
            })
    }

    async fetchAll<T>(queryTemplate: TemplateStringsArray, ...interpolations: any[]): Promise<Array<T>> {
        let result = await this.query(queryTemplate, ...interpolations);
        return result.recordset as Array<T>;
    }

    async fetchOne<T>(queryTemplate: TemplateStringsArray, ...interpolations: any[]): Promise<T | undefined> {
        let result: Array<T> = await this.fetchAll(queryTemplate, ...interpolations);
        return result.length > 0 ? result[0] : undefined;
    }

    async fetchAny(queryTemplate: TemplateStringsArray, ...interpolations: any[]): Promise<Array<any>> {
        let result = this.query(queryTemplate, ...interpolations);
        return (await result).recordset as Array<any>
    }

    async execute(queryTemplate: TemplateStringsArray, ...interpolations: any[]): Promise<number> {
        let result = await this.query(queryTemplate, ...interpolations);
        return result.rowsAffected.reduce((prev, rows) => prev + rows);
    }

    async runInTransaction<T>(execute: (db: Db) => Promise<T>): Promise<T> {
        return await execute(this)
    }

    private async query(queryTemplate: TemplateStringsArray, ...interpolations: any[]): Promise<IResult<any>> {
        let pool = await this.pool;
        let result = await pool.request()
            .query(queryTemplate, ...interpolations);

        const bigintColumns = Object.entries(result.recordset.columns)
            .filter(([_, column]) => typeof column.type === 'function' && column.type.name === 'BigInt')

        result.recordset.map(row => {
            return bigintColumns.reduce((prev, [key, _]) => {
                prev[key] = parseInt(row[key])
                return prev;
            }, row)
        })
        return result;
    }
}

export default new Db(process.env.SQLCONNSTR_CONNECTION_STRING);