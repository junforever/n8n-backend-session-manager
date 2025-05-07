import express from 'express';
import {
  login,
  verifySessionToken,
  logout,
  validateRequest,
} from '../controllers/authController.js';
import {
  validateRequestBodyGenerateJwt,
  validateRequestBodyVerifyJwt,
} from '../middleware/validateRequestBodyJwt.js';

export const authRouter = express.Router();

authRouter.post('/login', validateRequestBodyGenerateJwt, login);
authRouter.post(
  '/verify-token',
  validateRequestBodyVerifyJwt,
  verifySessionToken,
);
authRouter.post('/logout', validateRequestBodyVerifyJwt, logout);
authRouter.get('/validate', validateRequest);
authRouter.post('/block-user', validateRequest);
