import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  JSON_ERROR_HANDLER_CODE,
} from '../constants/constants.js';

export const jsonErrorHandler = (err, req, res, next) => {
  const { lang } = req;

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.jsonError[lang],
          errors.jsonError.log_es,
          JSON_ERROR_HANDLER_CODE,
        ),
      );
  }

  if (err instanceof Error && err.type === 'entity.too.large') {
    return res
      .status(413)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.bodySizeError[lang],
          errors.bodySizeError.log_es,
          JSON_ERROR_HANDLER_CODE,
        ),
      );
  }

  return res
    .status(500)
    .json(
      createResponse(
        false,
        ACTIONS_CHAT_ALERT_NOTIFICATION,
        errors.internalServerError[lang],
        errors.internalServerError.log_es,
        JSON_ERROR_HANDLER_CODE,
      ),
    );
};
