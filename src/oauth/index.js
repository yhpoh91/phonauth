import express from 'express';
import path from 'path';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

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
      state = crypto.randomBytes(16).toString('hex'),
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

    // Create State
    const { State } = databaseService;
    const stateObj = await State.create({
      id: uuid(),
      clientId,
      state,
      redirectUri,
    });
  
    res.redirect(`${publicHost}/login.html?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`);
  } catch (error) {
    next(error);
  }
});

router.post('/token', async (req, res, next) => {
  try {
    const {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: grantType,
      code,
    } = req.body;

    // Check Grant Type
    if (grantType !== 'authorization_code') {
      res.status(400).send('invalid grant type');
      return;
    }

    // TODO: Check Code

    // Check Client ID against Client Secret
    const { Client } = databaseService;
    const where = { id: clientId, secret: clientSecret, redirectUri };
    const query = { where };
    const client = await Client.findOne(query);
    if (client == null) {
      res.status(401).send('unauthenticated');
      return;
    }

    res.json({
      access_token: 'meowmeow',
      expires_in: 3600,
      token_type: 'bearer'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { number, state, redirectUri } = req.body;

    // Check State
    const { State } = databaseService;
    const where = { state, redirectUri };
    const stateQuery = { where };
    const stateObj = await State.findOne(stateQuery);
    if (stateObj == null) {
      const errorCode = 401;
      const errorText = encodeURIComponent('invalid_state');
      const errorDesc = encodeURIComponent('The OAuth state is not valid');
      res.redirect(`${publicHost}/error.html?code=${errorCode}&text=${errorText}&desc=${errorDesc}`);
      return;
    }
  
    // Submit Verify Request
    const result = await nexmoService.verify.request(number);
    if (result.ok) {
      const { requestId } = result;
      res.redirect(`${publicHost}/verify.html?number=${number}&request_id=${requestId}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`);
      return;
    }
  
    res.redirect(`${publicHost}/login.html?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&error=${result.errorText}`);
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const {
      number, code, state, redirectUri, requestId,
    } = req.body;

    // Check State
    const { State } = databaseService;
    const where = { state, redirectUri };
    const stateQuery = { where };
    const stateObj = await State.findOne(stateQuery);
    if (stateObj == null) {
      const errorCode = 401;
      const errorText = encodeURIComponent('invalid_state');
      const errorDesc = encodeURIComponent('The OAuth state is not valid');
      res.redirect(`${publicHost}/error.html?code=${errorCode}&text=${errorText}&desc=${errorDesc}`);
      return;
    }

    // Submit Verify Check
    const result = await nexmoService.verify.check(requestId, code);
    if (result.ok) {
      const { User } = databaseService;
      const where = { number };
      const query = { where };
      const user = await User.findOne(query);

      if (user == null) {
        L.debug(`User for number ${number} does not exist, proceed to user setup`);
        res.redirect(`${publicHost}/setup.html?number=${number}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`);
        return;
      }

      const userData = user.dataValues;
      userData.name = `${userData.firstName} ${userData.lastName}`;
      delete userData.createdAt;
      delete userData.updatedAt;

      // Delete State (state is no longer useful)
      State.destroy(stateQuery);

      res.json(userData);
      return;
    }

    L.error(`Error (${requestId}): ${result.errorText}`);
    res.redirect(`${publicHost}/verify.html?number=${number}&request_id=${requestId}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&error=${result.errorText}`);
  } catch (error) {
    next(error);
  }
});

router.post('/setup', async (req, res, next) => {
  try {
    const {
      number, firstName, lastName, email, redirectUri, state,
    } = req.body;

    // Check State
    const { State } = databaseService;
    const where = { state, redirectUri };
    const stateQuery = { where };
    const stateObj = await State.findOne(stateQuery);
    if (stateObj == null) {
      const errorCode = 401;
      const errorText = encodeURIComponent('invalid_state');
      const errorDesc = encodeURIComponent('The OAuth state is not valid');
      res.redirect(`${publicHost}/error.html?code=${errorCode}&text=${errorText}&desc=${errorDesc}`);
      return;
    }

    // Create New Phone User
    const { User } = databaseService;
    const user = await User.create({
      id: uuid(),
      number,
      firstName,
      lastName,
      email,
    });
    
    // Map User Data
    const userData = user.dataValues;
    userData.name = `${userData.firstName} ${userData.lastName}`;
    delete userData.createdAt;
    delete userData.updatedAt;

    // Delete State (state is no longer useful)
    State.destroy(stateQuery);

    res.json(userData);
  } catch (error) {
    next(error);
  }
});

export default router;
