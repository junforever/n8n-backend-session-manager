import express from 'express';
import { sanitizeRequest } from '../controllers/sanitizeController.js';

export const sanitizeRouter = express.Router();
sanitizeRouter.post('/', sanitizeRequest);
