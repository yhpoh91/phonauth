import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import helmet from 'helmet';

import apiRouter from './api';
import oauthRouter from './oauth'; 
import loggerService from './services/logger';
import errorHandler from './services/errorHandler';

const environment = process.env.NODE_ENV || 'development';
const listenIp = '0.0.0.0';
const listenPort = process.env.PORT || 8080;
const isHeroku = (process.env.IS_HEROKU || 'false').toLowerCase() === 'true';
const publicHost = isHeroku ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : process.env.PUBLIC_HOST;

const { L } = loggerService('Web Application');

// Application
const app = express();

app.set('trust proxy', true);
app.set('view engine', 'jade');

app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Api Router
app.use('/', express.static('public'));
app.get('/sinkhole', (req, res) => {
  L.debug(req.query);
  res.send();
});
app.use('/api', apiRouter);
app.use('/oauth', oauthRouter);
app.use(errorHandler.handleUnmatched);
app.use(errorHandler.handleError);

// Server
const httpServer = http.createServer(app);
httpServer.listen(listenPort, listenIp, () => {
  L.info(`Server (${environment}) listening on ${listenIp}:${listenPort}`);
  L.info(`Server is now accessible at ${publicHost}`);
});
