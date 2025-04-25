import express from 'express';
import { generateToken, verifyToken } from '../controllers/authController';

export const authRouter = express.Router();

authRouter.post('/generate-token', generateToken);
authRouter.post('/verify-token', verifyToken);
