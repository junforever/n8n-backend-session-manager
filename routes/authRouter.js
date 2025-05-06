import express from 'express';
import {
  generateToken,
  verifySessionToken,
  logout,
} from '../controllers/authController.js';
import {
  validateRequestBodyGenerateJwt,
  validateRequestBodyVerifyJwt,
} from '../middleware/validateRequestBodyJwt.js';

export const authRouter = express.Router();

authRouter.post(
  '/generate-token',
  validateRequestBodyGenerateJwt,
  generateToken,
);
authRouter.post(
  '/verify-token',
  validateRequestBodyVerifyJwt,
  verifySessionToken,
);
authRouter.post('/logout', validateRequestBodyVerifyJwt, logout);
