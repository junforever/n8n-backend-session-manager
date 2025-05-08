import { errors } from '../i18n/errors.js';
import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  TIME_OUT_CODE,
} from '../constants/constants.js';

export const requestTimeOut = (req, res, next) => {
  const { lang } = req;
  if (req.timedout) {
    return res
      .status(503)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          TIME_OUT_CODE,
          null,
          errors.timeoutError[lang],
          errors.timeoutError.log_es,
        ),
      );
  }
  next();
};

// Middleware para detener el procesamiento de solicitudes con timeout
export const haltOnTimedout = (req, res, next) => {
  if (!req.timedout) next();
};
