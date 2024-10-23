const express = require('express')
const db = require('./src/services/db')
const app = express()
const port = process.env.PORT

app.use(express.static('dist'))

app.get('/api/test', async (req, res) => {
    try {
        const result = await db.query('select * from Accounts');

        res.json(result.recordset)
    } catch (err) {
        res.status(500)
        res.send(err.message)
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})