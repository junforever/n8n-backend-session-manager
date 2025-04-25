import { createResponse } from '../utils/requestRespose.js';
export const invalidRoute = (req, res) => {
  res
    .status(404)
    .json(
      createResponse(
        false,
        process.env.ACTIONS_CHAT_ALERT_NOTIFICATION,
        `Invalid route: ${req.originalUrl}`,
      ),
    );
};
