import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  VALIDATE_REQUEST_HEADERS_CODE,
} from '../constants/constants.js';

export const validateRequestHeaders = (req, res, next) => {
  const uniqueId = req.headers['x-unique-id'];
  const clientId = req.headers['x-client-id'];
  const langHeader = req.headers['accept-language'];

  if (!uniqueId || !langHeader || !clientId) {
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          VALIDATE_REQUEST_HEADERS_CODE,
          null,
          errors.invalidHeadersError.es,
          errors.invalidHeadersError.log_es,
        ),
      );
  }
  // Extraer solo el primer idioma
  const lang = langHeader.split(',')[0].split('-')[0].toLowerCase();

  req.uniqueId = uniqueId;
  req.lang = lang;
  req.clientId = clientId;
  next();
};
