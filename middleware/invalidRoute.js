import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import { ACTIONS_CHAT_ALERT_NOTIFICATION } from '../constants/constants.js';

export const invalidRoute = (req, res) => {
  const { lang } = req.params;
  res
    .status(404)
    .json(
      createResponse(
        false,
        ACTIONS_CHAT_ALERT_NOTIFICATION,
        errors.invalidRouteError[lang],
      ),
    );
};
