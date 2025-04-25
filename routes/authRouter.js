import express from 'express';
import {
  generateToken,
  verifyToken,
  root,
} from '../controllers/authController.js';

export const authRouter = express.Router();

authRouter.get('/', root);
authRouter.post('/generate-token', generateToken);
authRouter.post('/verify-token', verifyToken);
