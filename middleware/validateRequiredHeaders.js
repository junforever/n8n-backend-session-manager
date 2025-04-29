import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import { ACTIONS_CHAT_ALERT_NOTIFICATION } from '../constants/constants.js';

export const validateRequiredHeaders = (req, res, next) => {
  const uniqueId = req.headers['x-unique-id'];
  const lang = req.headers['x-lang'];

  if (!uniqueId || !lang) {
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.invalidHeadersError.en,
        ),
      );
  }

  req.uniqueId = uniqueId;
  req.lang = lang.toLowerCase();
  next();
};
