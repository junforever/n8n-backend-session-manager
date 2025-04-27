import express from 'express';
import { root, sanitizeRequest } from '../controllers/sanitizeController.js';

export const sanitizeRouter = express.Router();
sanitizeRouter.get('/', root);
sanitizeRouter.post('/sanitize', sanitizeRequest);
