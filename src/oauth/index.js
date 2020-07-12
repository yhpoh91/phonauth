import express from 'express';
import path from 'path';
import { v4 as uuid } from 'uuid';

import databaseService from '../services/database';
import loggerService from '../services/logger';
import nexmoService from '../services/nexmo';

const { L } = loggerService('Phone Oauth Router');

const isHeroku = (process.env.IS_HEROKU || 'false').toLowerCase() === 'true';
const publicHost = isHeroku ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : process.env.PUBLIC_HOST;

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
  try {
    const {
      response_type: responseType,
      state,
      redirect_uri: redirectUri,
      client_id: clientId,
    } = req.query;
  
    if (clientId == null) {
      const errorCode = 401;
      const errorText = encodeURIComponent('invalid_client');
      const errorDesc = encodeURIComponent('The OAuth client ID was undefined.');
      res.redirect(`${publicHost}/error.html?code=${errorCode}&text=${errorText}&desc=${errorDesc}`);
      return;
    }
  
    const { Client } = databaseService;
    const where = { id: clientId };
    const query = { where };
    const client = await Client.findOne(query);
  
    if (client == null) {
      const errorCode = 401;
      const errorText = encodeURIComponent('invalid_client');
      const errorDesc = encodeURIComponent('The OAuth client was not found.');
      res.redirect(`${publicHost}/error.html?code=${errorCode}&text=${errorText}&desc=${errorDesc}`);
      return;
    }
  
    const clientData = client.dataValues;
    if (clientData.redirectUri !== redirectUri) {
      const errorCode = 401;
      const errorText = encodeURIComponent('invalid_redirect_uri');
      const errorDesc = encodeURIComponent('The OAuth redirect URI is not authorized');
      res.redirect(`${publicHost}/error.html?code=${errorCode}&text=${errorText}&desc=${errorDesc}`);
      return;
    }
  
    res.redirect(`${publicHost}/login.html?state=${state}&redirect_uri=${redirectUri}`);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log(req.body);
    const { number, state, redirectUri } = req.body;
  
    // Submit Verify Request
    const result = await nexmoService.verify.request(number);
    if (result.ok) {
      const { requestId } = result;
      res.redirect(`${publicHost}/verify.html?number=${number}&request_id=${requestId}&state=${state}&redirect_uri=${redirectUri}`);
      return;
    }
  
    res.redirect(`${publicHost}/login.html?state=${state}&redirect_uri=${redirectUri}&error=${result.errorText}`);
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res) => {
  try {
    console.log(req.body);
    const {
      number, code, state, redirectUri, requestId,
    } = req.body;

    // Submit Verify Check
    const result = await nexmoService.verify.check(requestId, code);
    if (result.ok) {
      const { User } = databaseService;
      const where = { number };
      const query = { where };
      const user = await User.findOne(query);

      if (user == null) {
        L.debug(`User for number ${number} does not exist, proceed to user setup`);
        res.redirect(`${publicHost}/setup.html?number=${number}&state=${state}&redirect_uri=${redirectUri}`);
        return;
      }

      const userData = user.dataValues;
      userData.name = `${userData.firstName} ${userData.lastName}`;
      delete userData.createdAt;
      delete userData.updatedAt;

      res.json(userData);
      return;
    }

    L.error(`Error (${requestId}): ${result.errorText}`);
    res.redirect(`${publicHost}/verify.html?number=${number}&request_id=${requestId}&state=${state}&redirect_uri=${redirectUri}&error=${result.errorText}`);
  } catch (error) {
    next(error);
  }
});

router.post('/setup', async (req, res) => {
  try {
    console.log(req.body);
    const {
      number, firstName, lastName, email,
    } = req.body;

    // Create New Phone User
    const { User } = databaseService;
    const user = await User.create({
      id: uuid(),
      number,
      firstName,
      lastName,
      email,
    });
    
    const userData = user.dataValues;
    userData.name = `${userData.firstName} ${userData.lastName}`;
    delete userData.createdAt;
    delete userData.updatedAt;

    res.json(userData);
  } catch (error) {
    next(error);
  }
});

export default router;
