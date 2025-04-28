import { createResponse } from '../utils/requestResponse.js';

const languages = ['es', 'en'];

export const languageValidation = (req, res, next) => {
  const { lang } = req.params;
  if (!lang || !languages.includes(lang)) {
    return res
      .status(400)
      .json(
        createResponse(
          false,
          process.env.ACTIONS_CHAT_ALERT_NOTIFICATION || 'alert',
          errors.languageError.en,
        ),
      );
  }
  next();
};
