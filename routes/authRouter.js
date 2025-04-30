import express from 'express';
import {
  generateToken,
  verifyToken,
  getRevokeTokens,
  logout,
} from '../controllers/authController.js';

export const authRouter = express.Router();

authRouter.post('/generate-token', generateToken);
authRouter.post('/verify-token', verifyToken);
authRouter.get('/get-revoke-tokens', getRevokeTokens);
authRouter.post('/logout', logout);
