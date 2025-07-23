import express from 'express';
import { checkRateLimit } from '../controllers/rateLimitController.js';

export const rateLimitRouter = express.Router();

// Ruta para verificar el estado del rate limit
rateLimitRouter.get('/check', checkRateLimit);
