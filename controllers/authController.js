import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  ACTIONS_CONTINUE,
} from '../constants/constants.js';
import { errors } from '../i18n/errors.js';

const cache = new NodeCache();
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_phrase';

export const generateToken = (req, res) => {
  const { lang } = req.params;
  const { userId, role } = req.body;
  if (!userId || !role)
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.userIdRoleError[lang],
        ),
      );
  const payload = {
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 15 * 60,
  };

  const token = jwt.sign(payload, JWT_SECRET);
  cache.set(`token_${userId}`, token, 15 * 60);

  res.json(createResponse(true, ACTIONS_CONTINUE, token));
};

export const verifyToken = (req, res) => {
  const { lang } = req.params;
  const { token } = req.body;
  if (!token)
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.userTokenError[lang],
        ),
      );

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const cached = cache.get(`token_${decoded.userId}`);

    if (!cached || cached !== token) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            ACTIONS_CHAT_ALERT_NOTIFICATION,
            errors.expiredTokenError[lang],
          ),
        );
    }
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res
      .status(401)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.expiredTokenError[lang],
        ),
      );
  }
};
