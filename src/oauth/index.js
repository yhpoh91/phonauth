import express from 'express';
import path from 'path';

import loggerService from '../services/logger';
import nexmoService from '../services/nexmo';

const { L } = loggerService('Phone Oauth Router');

const isHeroku = (process.env.IS_HEROKU || 'false').toLowerCase() === 'true';
const publicHost = isHeroku ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : process.env.PUBLIC_HOST;

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  const { state, redirect_uri: redirectUri } = req.query;
  res.redirect(`${publicHost}/login.html?state=${state}&redirect_uri=${redirectUri}`);
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
      res.redirect(`${publicHost}/setup.html?number=${number}&state=${state}&redirect_uri=${redirectUri}`);
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

    res.send('ok');
  } catch (error) {
    next(error);
  }
});

export default router;
