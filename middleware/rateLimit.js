import rateLimit from 'express-rate-limit';
import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  RATE_LIMIT_CODE,
} from '../constants/constants.js';
import { redisSet } from '../controllers/redisController.js';
import { redisKeysGenerator } from '../utils/redisKeysGenerator.js';

//se puede aplicar solo a un tipo de peticion
export const limiter = rateLimit({
  //intervalo de tiempo en ms (1 min)
  windowMs: (process.env.RATE_LIMIT_WINDOW_MS || 60) * 1000,
  //peticiones máximas segun el intervalo de tiempo
  max: process.env.RATE_LIMIT_MAX || 30,
  //identificador unico de la peticion
  keyGenerator: (req) => req.uniqueId || req.ip,
  //incluir encabezados estándar relacionados con la limitación de solicitudes
  //X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  standardHeaders: true,
  //excluir encabezados antiguos
  legacyHeaders: false,

  // Respuesta personalizada cuando se excede el límite
  handler: async (req, res, next, options) => {
    const { lang, uniqueId, clientId } = req;
    const { blockUserKey } = redisKeysGenerator(clientId, uniqueId);
    const { success } = await redisSet(
      blockUserKey,
      'true',
      parseInt(process.env.BLOCK_EXPIRATION_MINUTES) || 60,
    );

    if (!success) {
      return res
        .status(500)
        .json(
          createResponse(
            false,
            ACTIONS_CHAT_ALERT_NOTIFICATION,
            RATE_LIMIT_CODE,
            null,
            errors.redisOperationError[lang],
            errors.redisOperationError.log_es.replace('<operation>', 'set'),
          ),
        );
    }

    res
      .status(options.statusCode)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          RATE_LIMIT_CODE,
          null,
          errors.rateLimitError[lang],
          errors.rateLimitError.log_es,
        ),
      );
  },
});
