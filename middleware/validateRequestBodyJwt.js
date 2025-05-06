import { z } from 'zod';
import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  VALIDATE_REQUEST_BODY_CODE,
} from '../constants/constants.js';

const requestSchema = z.object({
  role: z
    .string({
      required_error: 'roleRequiredError',
    })
    .min(4, { message: 'roleMinLengthError' }),
  name: z
    .string({
      required_error: 'nameRequiredError',
    })
    .min(3, { message: 'nameMinLengthError' }),
  token: z.string({ required_error: 'tokenRequiredError' }),
});

export const validateRequestBodyGenerateJwt = (req, res, next) => {
  const { lang, body } = req;
  const partialSchema = requestSchema.pick({
    role: true,
    name: true,
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
          `${errors.bodyValidationError[lang]} : ${zodErrors.join(' ')}`,
          errors.bodyValidationError.log_es,
          VALIDATE_REQUEST_BODY_CODE,
        ),
      );
  }

  next();
};

export const validateRequestBodyVerifyJwt = (req, res, next) => {
  const { lang, body } = req;
  const partialSchema = requestSchema.pick({
    token: true,
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
          `${errors.bodyValidationError[lang]} : ${zodErrors.join(' ')}`,
          errors.bodyValidationError.log_es,
          VALIDATE_REQUEST_BODY_CODE,
        ),
      );
  }

  next();
};
