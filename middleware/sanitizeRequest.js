import validator from 'validator';

function sanitizeBody(body) {
  try {
    const sanitized = {};

    for (const key in body) {
      if (typeof body[key] === 'string') {
        sanitized[key] = validator.stripLow(
          validator.escape(validator.trim(body[key])),
          true,
        );
      } else {
        sanitized[key] = body[key];
      }
    }

    return sanitized;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `There was an error sanitizing the request: ${error.message}`,
      );
    }
    throw new Error('There was an error sanitizing the request');
  }
}

export const sanitizeRequest = (req, res, next) => {
  try {
    // Ejecutar solo si el método HTTP es POST, PUT o PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body && Object.keys(req.body).length > 0) {
        req.body = sanitizeBody(req.body);
      }
    }
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        action: process.env.ACTIONS_CHAT_ALERT_NOTIFICATION || 'alert',
        data: `There was an error sanitizing the request: ${error.message}`,
      });
    }
  }
};
