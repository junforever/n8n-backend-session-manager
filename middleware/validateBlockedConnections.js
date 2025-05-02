import { verifyBlockedConnection } from '../controllers/blockedConnectionController.js';
import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_ALERT_NOTIFICATION,
  VALIDATE_BLOCKED_CONNECTIONS_CODE,
  ACTIONS_CHAT_NOTIFICATION,
} from '../constants/constants.js';

export const validateBlockedConnections = async (req, res, next) => {
  const { lang, uniqueId } = req;
  const { success, data } = await verifyBlockedConnection(uniqueId);
  if (!success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_ALERT_NOTIFICATION,
          null,
          errors.redisOperationError.log_es
            .replace('<operation>', 'get')
            .concat(`${data}`),
          VALIDATE_BLOCKED_CONNECTIONS_CODE,
        ),
      );
  }
  if (data) {
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
