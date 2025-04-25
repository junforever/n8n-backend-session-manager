import validator from 'validator';

function sanitizeBody(body) {
  const sanitized = {};

  for (const key in body) {
    if (typeof body[key] === 'string') {
      sanitized[key] = validator.escape(body[key].trim());
    } else {
      sanitized[key] = body[key];
    }
  }

  return sanitized;
}

export const sanitizeRequest = (req, res, next) => {
  req.body = sanitizeBody(req.body);
  next();
};
