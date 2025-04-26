import { createResponse } from '../utils/requestRespose.js';

export const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res
      .status(400)
      .json(
        createResponse(
          false,
          process.env.ACTIONS_CHAT_ALERT_NOTIFICATION,
          `Invalid JSON format in request: ${req.originalUrl}`,
        ),
      );
  }
  return res
    .status(500)
    .json(
      createResponse(
        false,
        process.env.ACTIONS_CHAT_ALERT_NOTIFICATION,
        `Internal server error : ${req.originalUrl}`,
      ),
    );
};
