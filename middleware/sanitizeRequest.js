import validator from 'validator';
import { errors } from '../i18n/errors.js';
import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  SANITIZE_REQUEST_CODE,
} from '../constants/constants.js';

function sanitizeBody(body) {
  try {
    const sanitized = {};
    for (const key in body) {
      if (typeof body[key] === 'string') {
        sanitized[key] = validator.stripLow(
          validator.escape(validator.trim(body[key])),
          true,
        );
      } else {
        sanitized[key] = body[key];
      }
    }

    return sanitized;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('');
  }
}

export const sanitizeRequest = (req, res, next) => {
  const { lang } = req;

  try {
    // Ejecutar solo si el método HTTP es POST, PUT o PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body && Object.keys(req.body).length > 0) {
        req.body = sanitizeBody(req.body);
      }
    }
    next();
  } catch (_error) {
    res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          SANITIZE_REQUEST_CODE,
          null,
          errors.sanitizeError[lang],
          errors.sanitizeError.log_es,
        ),
      );
  }
};
