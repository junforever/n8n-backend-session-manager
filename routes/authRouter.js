import express from 'express';
import {
  generateToken,
  verifyToken,
  logout,
} from '../controllers/authController.js';

export const authRouter = express.Router();

authRouter.post('/generate-token', generateToken);
authRouter.post('/verify-token', verifyToken);
authRouter.post('/logout', logout);
