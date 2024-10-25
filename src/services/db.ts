import { ConnectionPool, IResult } from 'mssql';

class Db {
    private pool: Promise<ConnectionPool>;

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

    async query(query: string): Promise<IResult<any>> {
        let pool = await this.pool;
        let result = await pool.request()
            .query(query);
        return result;
    }
}

export default new Db(process.env.SQLCONNSTR_CONNECTION_STRING);