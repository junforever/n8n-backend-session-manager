import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_NOTIFICATION,
  VALIDATE_BLOCKED_CONNECTIONS_CODE,
} from '../constants/constants.js';
import NodeCache from 'node-cache';

const cache = new NodeCache();

export const validateBlockedConnections = (req, res, next) => {
  const { lang, uniqueId } = req;

  if (cache.get(`block_${uniqueId}`)) {
    return res
      .status(423)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_NOTIFICATION,
          errors.blockedConnectionError[lang],
          errors.blockedConnectionError.log_es,
          VALIDATE_BLOCKED_CONNECTIONS_CODE,
        ),
      );
  }

  next();
};
