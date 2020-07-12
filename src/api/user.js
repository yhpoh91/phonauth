import express from 'express';
import path from 'path';

import databaseService from '../services/database';
import loggerService from '../services/logger';
import authorizer from '../services/authorizer';

const { L } = loggerService('User Router');

const router = express.Router({ mergeParams: true });

const mapUser = (user) => {
  const mappedUser = user.dataValues;
  delete mappedUser.createdAt;
  delete mappedUser.updatedAt;

  return mappedUser;
};

router.get(
  '/',
  authorizer.authorize,
  async (req, res, next) => {
    try {
      const { User } = databaseService;
      const users = await User.findAll({});
      const mappedUsers = users.map(mapUser);
      res.json(mappedUsers);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:userId',
  authorizer.authorize,
  async (req, res, next) => {
    try {
      const { User } = databaseService;
      const where = { id: req.params.userId };
      const query = { where };
      const client = await User.findOne(query);
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
  '/:userId',
  authorizer.authorize,
  async (req, res, next) => {
    try {
      const { User } = databaseService;
      const where = { id: req.params.userId };
      const query = { where };
      const changes = {};
      if (req.body.firstName && req.body.firstName !== '') {
        changes.firstName = req.body.firstName;
      }
      if (req.body.lastName && req.body.lastName !== '') {
        changes.lastName = req.body.lastName;
      }
      if (req.body.email && req.body.email !== '') {
        changes.email = req.body.email;
      }

      await User.update(changes, query);
      res.send();
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:userId',
  authorizer.authorize,
  async (req, res, next) => {
    try {
      const { User } = databaseService;
      const where = { id: req.params.userId };
      const query = { where };
      await User.destroy(query);
      res.send();
    } catch (error) {
      next(error);
    }
  },
);


export default router;
