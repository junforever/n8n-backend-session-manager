import express from 'express';
import { root } from '../controllers/rootController.js';

export const rootRouter = express.Router();
rootRouter.get('/', root);
