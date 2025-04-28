import { errors } from '../i18n/errors.js';
import { createResponse } from '../utils/requestResponse.js';

export const requestTimeOut = (req, res, next) => {
  const { lang } = req.params;
  if (req.timedout) {
    return res
      .status(503)
      .json(
        createResponse(
          false,
          process.env.ACTIONS_CHAT_ALERT_NOTIFICATION || 'alert',
          errors.timeoutError[lang],
        ),
      );
  }
  next();
};

// Middleware para detener el procesamiento de solicitudes con timeout
export const haltOnTimedout = (req, res, next) => {
  if (!req.timedout) next();
};
