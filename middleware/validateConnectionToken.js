import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import { ACTIONS_CHAT_ALERT_NOTIFICATION } from '../constants/constants.js';

export const validateConnectionToken = (req, res, next) => {
  const lang = req?.body?.lang || 'en';
  const token = req.headers['authorization'];

  // Verificar que el token esté presente y sea válido
  if (!token || token.replace('Bearer ', '') !== process.env.SESSION_SECRET) {
    return res
      .status(403)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.invalidTokenError[lang],
        ),
      );
  }
  next();
};
