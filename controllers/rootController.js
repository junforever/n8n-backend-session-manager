import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_DO_NOTHING,
  ROOT_CONTROLLER_CODE,
} from '../constants/constants.js';

export const root = (req, res) => {
  res.json(
    createResponse(
      true,
      ACTIONS_DO_NOTHING,
      ROOT_CONTROLLER_CODE,
      'Welcome to n8n backend api management',
    ),
  );
};
