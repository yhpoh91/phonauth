import express from 'express';
import path from 'path';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

import databaseService from '../services/database';
import loggerService from '../services/logger';
import authorizer from '../services/authorizer';

const { L } = loggerService('Client Router');

const router = express.Router({ mergeParams: true });

const mapClient = (client) => {
  const mappedClient = client.dataValues;
  delete mappedClient.createdAt;
  delete mappedClient.updatedAt;

  return mappedClient;
};

router.get(
  '/',
  authorizer.authorize,
  async (req, res, next) => {
    try {
      const { Client } = databaseService;
      const clients = await Client.findAll({});
      const mappedClients = clients.map(mapClient);
      res.json(mappedClients);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/',
  authorizer.authorize,
  async (req, res, next) => {
    try {
      const { Client } = databaseService;
      const client = await Client.create({
        id: uuid(),
        secret: crypto.randomBytes(64).toString('hex'),
        redirectUri: req.body.redirectUri,
      });
      const mappedClient = mapClient(client);
      res.status(201).json(mappedClient);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:clientId',
  authorizer.authorize,
  async (req, res, next) => {
    try {
      const { Client } = databaseService;
      const where = { id: req.params.clientId };
      const query = { where };
      const client = await Client.findOne(query);
      if (client == null) {
        res.status(404).send();
        return;
      }

      const mappedClient = mapClient(client);
      res.json(mappedClient);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/:clientId',
  authorizer.authorize,
  async (req, res, next) => {
    try {
      const { Client } = databaseService;
      const where = { id: req.params.clientId };
      const query = { where };
      const changes = {};
      if (req.body.redirectUri && req.body.redirectUri !== '') {
        changes.redirectUri = req.body.redirectUri;
      }

      await Client.update(changes, query);
      res.send();
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:clientId',
  authorizer.authorize,
  async (req, res, next) => {
    try {
      const { Client } = databaseService;
      const where = { id: req.params.clientId };
      const query = { where };
      await Client.destroy(query);
      res.send();
    } catch (error) {
      next(error);
    }
  },
);


export default router;
