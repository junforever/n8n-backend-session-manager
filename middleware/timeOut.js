export const requestTimeOut = (req, res, next) => {
  if (req.timedout) {
    return res
      .status(503)
      .json(
        createResponse(
          false,
          process.env.ACTIONS_CHAT_ALERT_NOTIFICATION,
          `Timeout reached - Method: ${req.method} Url: ${req.originalUrl}`,
        ),
      );
  }
  next();
};
