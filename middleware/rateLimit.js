import rateLimit from 'express-rate-limit';
//TODO: definir si se usa get o post para la verificacion
export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.body?.userId || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});
