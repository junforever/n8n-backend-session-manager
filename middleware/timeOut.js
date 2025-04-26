export const requestTimeOut = (req, res, next) => {
  if (req.timedout) {
    return res
      .status(503)
      .json(
        createResponse(
          false,
          process.env.ACTIONS_CHAT_ALERT_NOTIFICATION || 'alert',
          `Timeout reached - Method: ${req.method} Url: ${req.originalUrl}`,
        ),
      );
  }
  next();
};

// Middleware para detener el procesamiento de solicitudes con timeout
export const haltOnTimedout = (req, res, next) => {
  if (!req.timedout) next();
};
