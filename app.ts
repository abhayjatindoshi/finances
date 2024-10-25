import express from 'express';
import { loadRouters } from './src/routes/load-routers';

const app = express();
const port = process.env['PORT']

app.use(express.static('static'));
loadRouters(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})