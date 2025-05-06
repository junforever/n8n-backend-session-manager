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
  const { success } = await redisGet(blockUserKey);
  if (!success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace('<operation>', 'get'),
          VALIDATE_BLOCKED_CONNECTIONS_CODE,
        ),
      );
  }
  if (success) {
    return res
      .status(200)
      .json(
        createResponse(
          true,
          ACTIONS_CHAT_NOTIFICATION,
          errors.rateLimitError[lang],
          null,
          VALIDATE_BLOCKED_CONNECTIONS_CODE,
        ),
      );
  }
  next();
};
