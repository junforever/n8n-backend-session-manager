import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  VALIDATE_REQUEST_BODY_CODE,
  JWT_SECRET,
  ACTIONS_CHAT_NOTIFICATION,
} from '../constants/constants.js';
import { redisGet } from '../controllers/redisController.js';

const requestSchema = z.object({
  password: z.string({ required_error: 'passwordRequiredError' }),
  token: z.string({ required_error: 'tokenRequiredError' }),
});

export const validateRequestBodyGenerateJwt = (req, res, next) => {
  const { lang, body } = req;
  const partialSchema = requestSchema.pick({
    password: true,
  });
  const validation = partialSchema.safeParse(body);

  if (!validation.success) {
    const zodErrors = validation.error.errors.map(
      (err) => errors[err.message][lang],
    );
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.bodyValidationError[lang],
          `${errors.bodyValidationError.log_es} : ${zodErrors.join(' ')}`,
          VALIDATE_REQUEST_BODY_CODE,
        ),
      );
  }

  next();
};

export const validateRequestBodyVerifyJwt = async (req, res, next) => {
  const { lang, body } = req;
  const partialSchema = requestSchema.pick({
    token: true,
  });
  const validation = partialSchema.safeParse(body);

  //verificar que el body tenga el token
  if (!validation.success) {
    const zodErrors = validation.error.errors.map(
      (err) => errors[err.message][lang],
    );
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.bodyValidationError[lang],
          `${errors.bodyValidationError.log_es} : ${zodErrors.join(' ')}`,
          VALIDATE_REQUEST_BODY_CODE,
        ),
      );
  }

  try {
    //verificar que el token sea valido
    const token = body.token;
    const { exp } = jwt.verify(token, JWT_SECRET);

    // Verificar si el token está en la lista de revocados
    const revocationResp = await redisGet(token);

    if (!revocationResp.success) {
      return res
        .status(500)
        .json(
          createResponse(
            false,
            ACTIONS_CHAT_ALERT_NOTIFICATION,
            errors.redisOperationError[lang],
            errors.redisOperationError.log_es.replace(
              '<operation>',
              'get revoked',
            ),
            VALIDATE_REQUEST_BODY_CODE,
          ),
        );
    }

    //si la clave existe significa que el token esta revocado
    if (revocationResp.data) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            ACTIONS_CHAT_NOTIFICATION,
            errors.tokenRevokedError[lang],
            errors.tokenRevokedError.log_es,
            VALIDATE_REQUEST_BODY_CODE,
          ),
        );
    }

    req.sessionExp = exp;
    next();
  } catch (error) {
    let errorType;
    if (error instanceof jwt.TokenExpiredError) {
      errorType = 'expirado';
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorType = 'invalido';
    } else {
      errorType = `otro (${error.message})`;
    }
    return res
      .status(401)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_NOTIFICATION,
          errors.invalidSessionTokenError[lang],
          `errors.invalidSessionTokenError.log_es (${errorType})`,
          VALIDATE_REQUEST_BODY_CODE,
        ),
      );
  }
};
