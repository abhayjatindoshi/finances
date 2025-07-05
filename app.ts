import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import { errorHandler, loadRouters } from './src/server-utils';
import { setupAuthentication } from './src/services/passport';

const app = express();
const port = process.env.PORT || 8080;

// backend api configuration
app.use('/api', bodyParser.json({ limit: '10mb' }));
setupAuthentication('/api', app);
loadRouters('/api', app);
app.use('/api', errorHandler)

// frontend html5 configuration
app.use(express.static('dist/static'));

// Handle /new route for cursor-ai client
app.use('/new', express.static('dist/static/new'));
app.use('/new/*', (req, res) => {
    const indexFile = path.resolve('dist/static/new/index.html')
    res.sendFile(indexFile)
});

// Handle main app routes
app.use((req, res) => {
    const indexFile = path.resolve('dist/static/index.html')
    res.sendFile(indexFile)
})

app.listen(port, () => {
    console.log(`Finances app listening on port ${port}`)
})