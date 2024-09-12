import express from 'express';
import path from 'path';
import { APP_PORT, DB_URL } from './config';
import errorHandler from './middlewares/errorHandlers';
const app = express();

import routes from './routes'

// data base connection
import mongoose from 'mongoose';

global.appRoot = path.resolve(__dirname);

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to the database');
});

mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});


// to deal with multipart data
app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
// by default, the ability to read json files is disabled in express
app.use(express.json());

app.use('/api', routes);

app.use('/', (req, res) => {
    res.send(`
  <h1>Welcome to E-commerce Rest APIs</h1>
  You may contact me <a href="https://github/kaushal_av">here</a>
  Or You may reach out to me for any question related to this Apis: arya31126@gmail.com
  `);
});

app.use(errorHandler);
app.listen(APP_PORT, () => {
    console.log(`Server started on port ${APP_PORT}`);
});