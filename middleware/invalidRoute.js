import { createResponse } from '../utils/requestResponse.js';
export const invalidRoute = (req, res) => {
  res
    .status(404)
    .json(
      createResponse(
        false,
        process.env.ACTIONS_CHAT_ALERT_NOTIFICATION || 'alert',
        `Invalid route: ${req.originalUrl}`,
      ),
    );
};
