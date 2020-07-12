import express from 'express';
import path from 'path';
import { v4 as uuid } from 'uuid';

import loggerService from '../services/logger';
import userRouter from './user';
import clientRouter from './client';

const { L } = loggerService('API Router');

const router = express.Router({ mergeParams: true });
router.use('/users', userRouter);
router.use('/clients', clientRouter);

export default router;
