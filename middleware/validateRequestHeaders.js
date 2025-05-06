import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  VALIDATE_REQUEST_HEADERS_CODE,
} from '../constants/constants.js';

export const validateRequestHeaders = (req, res, next) => {
  const uniqueId = req.headers['x-unique-id'];
  const clientId = req.headers['x-client-id'];
  const lang = req.headers['x-lang'];

  if (!uniqueId || !lang || !clientId) {
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.invalidHeadersError.es,
          errors.invalidHeadersError.log_es,
          VALIDATE_REQUEST_HEADERS_CODE,
        ),
      );
  }

  req.uniqueId = uniqueId;
  req.lang = lang.toLowerCase();
  req.clientId = clientId;
  next();
};
