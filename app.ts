import express from 'express';
import { errorHandler, loadRouters } from './src/server-utils';
import bodyParser from 'body-parser';

const app = express();
const port = process.env['PORT']

app.use(express.static('dist/static'));
app.use(bodyParser.json());
loadRouters(app);
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})