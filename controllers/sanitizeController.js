import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_DO_NOTHING,
  ACTIONS_CONTINUE,
} from '../constants/constants.js';

export const root = (req, res) => {
  res.json(
    createResponse(
      true,
      ACTIONS_DO_NOTHING,
      'Welcome to n8n backend api management',
    ),
  );
};

export const sanitizeRequest = (req, res) => {
  res.json(createResponse(true, ACTIONS_CONTINUE, req.body));
};
