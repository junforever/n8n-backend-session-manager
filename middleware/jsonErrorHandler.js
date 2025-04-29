import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import { ACTIONS_CHAT_ALERT_NOTIFICATION } from '../constants/constants.js';

export const jsonErrorHandler = (err, req, res, next) => {
  const { lang } = req;
  console.log(err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.jsonError[lang],
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
      ),
    );
};
