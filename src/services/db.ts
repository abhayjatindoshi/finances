import { ConnectionPool, IResult, PreparedStatement } from 'mssql';

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

    async execute(queryTemplate: TemplateStringsArray, ...interpolations: any[]): Promise<number> {
        let result = await this.query(queryTemplate, ...interpolations);
        return result.rowsAffected[0];
    }

    private async query(queryTemplate: TemplateStringsArray, ...interpolations: any[]): Promise<IResult<any>> {
        let pool = await this.pool;
        let result = await pool.request()
            .query(queryTemplate, ...interpolations);
        return result;
    }
}

export default new Db(process.env.SQLCONNSTR_CONNECTION_STRING);