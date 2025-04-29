import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_CONTINUE,
  SANITIZE_CONTROLLER_CODE,
} from '../constants/constants.js';

export const sanitizeRequest = (req, res) => {
  res.json(
    createResponse(
      true,
      ACTIONS_CONTINUE,
      req.body,
      null,
      SANITIZE_CONTROLLER_CODE,
    ),
  );
};
