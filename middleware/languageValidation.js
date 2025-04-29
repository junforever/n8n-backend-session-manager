import { createResponse } from '../utils/requestResponse.js';
import { errors } from '../i18n/errors.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  LANGUAGE_VALIDATION_CODE,
} from '../constants/constants.js';

const languages = ['es', 'en'];

export const languageValidation = (req, res, next) => {
  const { lang } = req;

  if (!lang || !languages.includes(lang)) {
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.languageError.en,
          errors.languageError.log_es,
          LANGUAGE_VALIDATION_CODE,
        ),
      );
  }
  req.lang = lang;
  next();
};
