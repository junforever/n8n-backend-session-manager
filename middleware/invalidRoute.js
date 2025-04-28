import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';

export const invalidRoute = (req, res) => {
  const { lang } = req.params;
  res
    .status(404)
    .json(
      createResponse(
        false,
        process.env.ACTIONS_CHAT_ALERT_NOTIFICATION || 'alert',
        errors.invalidRouteError[lang],
      ),
    );
};
