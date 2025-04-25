export const requestTimeOut = (req, res, next) => {
  if (req.timedout) {
    console.warn(`[TIMEOUT] ${req.method} ${req.originalUrl}`);
    return res
      .status(503)
      .json({ error: 'La petición tardó demasiado en responder.' });
  }
  next();
};
