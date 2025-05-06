import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  VALIDATE_CONNECTION_TOKEN_CODE,
} from '../constants/constants.js';

export const validateConnectionToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token || token.replace('Bearer ', '') !== process.env.SESSION_SECRET) {
    return res
      .status(403)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.invalidSecurityTokenError.es,
          errors.invalidSecurityTokenError.log_es,
          VALIDATE_CONNECTION_TOKEN_CODE,
        ),
      );
  }
  next();
};
