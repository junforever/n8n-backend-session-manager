import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  VALIDATE_BLOCKED_CONNECTIONS_CODE,
  ACTIONS_CHAT_NOTIFICATION,
} from '../constants/constants.js';
import { redisKeysGenerator } from '../utils/redisKeysGenerator.js';
import { redisGet } from '../controllers/redisController.js';

export const validateBlockedConnections = async (req, res, next) => {
  const { lang, uniqueId, clientId } = req;
  const { blockUserKey } = redisKeysGenerator(clientId, uniqueId);
  const { success, data } = await redisGet(blockUserKey);
  if (!success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          VALIDATE_BLOCKED_CONNECTIONS_CODE,
          null,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace('<operation>', 'get'),
        ),
      );
  }
  if (data) {
    return res
      .status(423)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_NOTIFICATION,
          VALIDATE_BLOCKED_CONNECTIONS_CODE,
          null,
          errors.rateLimitError[lang],
        ),
      );
  }
  next();
};
