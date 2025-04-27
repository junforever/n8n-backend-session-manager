import rateLimit from 'express-rate-limit';
import { createResponse } from '../utils/requestResponse.js';

//se puede aplicar solo a un tipo de peticion
export const limiter = rateLimit({
  //intervalo de tiempo en ms (1 min)
  windowMs: (process.env.RATE_LIMIT_WINDOW_MS || 60) * 1000,
  //peticiones máximas segun el intervalo de tiempo
  max: process.env.RATE_LIMIT_MAX || 30,
  //identificador unico de la peticion
  keyGenerator: (req) => req.body?.userId || req.ip,
  //incluir encabezados estándar relacionados con la limitación de solicitudes
  //X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  standardHeaders: true,
  //excluir encabezados antiguos
  legacyHeaders: false,

  // Respuesta personalizada cuando se excede el límite
  handler: (req, res, next, options) => {
    //options.statusCode 429 (Too Many Requests)
    res
      .status(options.statusCode)
      .json(
        createResponse(
          false,
          process.env.ACTIONS_CHAT_ALERT_NOTIFICATION || 'alert',
          `Too many requests. Please try again later. RetryAfter: ${res.get(
            'Retry-After',
          )} sec.`,
        ),
      );
  },
});
