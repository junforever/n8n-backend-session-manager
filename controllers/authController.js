import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  ACTIONS_CONTINUE,
  AUTH_CONTROLLER_CODE,
} from '../constants/constants.js';
import { errors } from '../i18n/errors.js';

const cache = new NodeCache();
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_phrase';

export const generateToken = (req, res) => {
  const { lang } = req;
  const { userId, role } = req.body;
  if (!userId || !role)
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.userIdRoleError[lang],
          errors.userIdRoleError.log_es,
          AUTH_CONTROLLER_CODE,
        ),
      );
  const payload = {
    userId,
    role,
    exp:
      Math.floor(Date.now() / 1000) +
      parseInt(process.env.JWT_EXPIRATION_MINUTES) * 60,
  };

  const token = jwt.sign(payload, JWT_SECRET);
  cache.set(
    `token_${userId}`,
    token,
    parseInt(process.env.JWT_EXPIRATION_MINUTES) * 60,
  );

  res.json(
    createResponse(
      true,
      ACTIONS_CONTINUE,
      token,
      null,
      null,
      AUTH_CONTROLLER_CODE,
    ),
  );
};

export const verifyToken = (req, res) => {
  const { lang } = req;
  const { token } = req.body;
  if (!token)
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.userTokenError[lang],
          errors.userTokenError.log_es,
          AUTH_CONTROLLER_CODE,
        ),
      );

  try {
    const userData = jwt.verify(token, JWT_SECRET);
    const cached = cache.get(`token_${userData.userId}`);

    if (!cached || cached !== token) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            ACTIONS_CHAT_ALERT_NOTIFICATION,
            errors.expiredTokenError[lang],
            errors.expiredTokenError.log_es,
            AUTH_CONTROLLER_CODE,
          ),
        );
    }
    res.json(createResponse(true, ACTIONS_CONTINUE, userData));
  } catch (err) {
    res
      .status(401)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.expiredTokenError[lang],
          errors.expiredTokenError.log_es,
          AUTH_CONTROLLER_CODE,
        ),
      );
  }
};
