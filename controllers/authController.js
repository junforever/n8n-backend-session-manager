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
    createResponse(true, ACTIONS_CONTINUE, token, null, AUTH_CONTROLLER_CODE),
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

  // Verificar si el token está en la lista de revocados
  if (cache.get(`revoked_${token}`)) {
    return res
      .status(401)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.tokenRevokedError[lang],
          errors.tokenRevokedError.log_es,
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  try {
    const userData = jwt.verify(token, JWT_SECRET);
    const cached = cache.get(`token_${userData.userId}`);
    console.log({ cached, userData });

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
    res.json(
      createResponse(
        true,
        ACTIONS_CONTINUE,
        userData,
        null,
        AUTH_CONTROLLER_CODE,
      ),
    );
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

export const logout = (req, res) => {
  const { lang } = req;
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res
      .status(400)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.logoutError[lang],
          errors.logoutError.log_es,
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const exp = decoded.exp;

    // Definir un TTL mayor al tiempo máximo de sesión activa, 5 minutos adicionales
    const revokeTTL = exp - Math.floor(Date.now() / 1000) + 5 * 60;

    // Guardar el token revocado en cache con su TTL
    cache.set(`revoked_${token}`, true, revokeTTL);

    // Eliminar el token del cache
    cache.del(`token_${userId}`);

    return res.json(
      createResponse(true, ACTIONS_CONTINUE, null, null, AUTH_CONTROLLER_CODE),
    );
  } catch (err) {
    return res
      .status(401)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.sessionAlreadyRevokedError[lang],
          errors.sessionAlreadyRevokedError.log_es,
          AUTH_CONTROLLER_CODE,
        ),
      );
  }
};

export const getRevokeTokens = (req, res) => {
  // console.log(cached);
  // console.log(cache.getStats());
  const expiredTokens = cache.getStats().expired;
  console.log(cache.keys());
  console.log(cache.get(`token_junforever`));
  res.json(
    createResponse(
      true,
      ACTIONS_CONTINUE,
      expiredTokens,
      null,
      AUTH_CONTROLLER_CODE,
    ),
  );
};
