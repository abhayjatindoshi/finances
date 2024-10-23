const sql = require('mssql')

class Db {
    constructor(connectionString) {
        this.pool = new sql.ConnectionPool(connectionString)
            .connect()
            .then(pool => {
                console.log('db connected');
                return pool;
            })
            .catch(err => {
                throw new Error('Failed to connect to db.', err);
            })
    }

    async query(query) {
        let pool = await this.pool;
        let result = await pool.request()
            .query(query);
        return result;
    }
}

module.exports = new Db(process.env.CONNECTION_STRING);