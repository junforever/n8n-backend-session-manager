import { z } from 'zod';
import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  VALIDATE_REQUEST_BODY_CODE,
} from '../constants/constants.js';

// El body de la request debe tener al menos el campo uniqueId
const requestSchema = z.object({
  uniqueId: z
    .string({
      required_error: 'uniqueIdRequiredError',
    })
    .min(5, { message: 'uniqueIdMinLengthError' }),
});

export const validateRequestBody = (req, res, next) => {
  const { lang, body } = req;
  const validation = requestSchema.safeParse(body);

  console.log(body);
  if (!validation.success) {
    console.log(validation.error.errors);
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
