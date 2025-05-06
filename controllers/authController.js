import jwt from 'jsonwebtoken';
import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  ACTIONS_CONTINUE,
  AUTH_CONTROLLER_CODE,
  ACTIONS_CHAT_NOTIFICATION,
} from '../constants/constants.js';
import { errors } from '../i18n/errors.js';
import { redisSet, redisGet, redisDel } from './redisController.js';
import { redisKeysGenerator } from '../utils/redisKeysGenerator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_phrase';

export const generateToken = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { role, name } = req.body;
  const { sessionKey } = redisKeysGenerator(uniqueId, clientId);
  const ttl = parseInt(process.env.JWT_EXPIRATION_MINUTES) * 60;
  const payload = {
    uniqueId,
    name,
    role,
    clientId,
    exp: Math.floor(Date.now() / 1000) + ttl,
  };

  const token = jwt.sign(payload, JWT_SECRET);

  //crear el registro de inicio de sesión en redis
  const resp = await redisSet(res, sessionKey, token, ttl);

  if (!resp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace('<operation>', 'set'),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  res.json(
    createResponse(true, ACTIONS_CONTINUE, token, null, AUTH_CONTROLLER_CODE),
  );
};

export const verifySessionToken = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { token } = req.body;
  const { role, name } = jwt.verify(token, JWT_SECRET);
  const { revokedKey, sessionKey } = redisKeysGenerator(uniqueId, clientId);

  // Verificar si el token está en la lista de revocados
  const revocationResp = await redisGet(revokedKey);

  if (!revocationResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace('<operation>', 'get'),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  if (revocationResp.data === token) {
    return res
      .status(401)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_NOTIFICATION,
          errors.tokenRevokedError[lang],
          errors.tokenRevokedError.log_es,
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  const sessionTokenResp = await redisGet(sessionKey);

  if (!sessionTokenResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace('<operation>', 'get'),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  if (!sessionTokenResp.data || sessionTokenResp.data !== token) {
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
      { role, name },
      null,
      AUTH_CONTROLLER_CODE,
    ),
  );
};

export const logout = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { token } = req.body;

  const { exp } = jwt.verify(token, JWT_SECRET);
  const { revokedKey } = redisKeysGenerator(uniqueId, clientId);

  // Definir un TTL mayor al tiempo máximo de sesión activa, 5 minutos adicionales
  const revokeTTL = exp - Math.floor(Date.now() / 1000) + 5 * 60;

  // Guardar el token revocado en redis con su TTL
  const revokeResp = await redisSet(revokedKey, token, revokeTTL);

  if (!revokeResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace('<operation>', 'set'),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  // Eliminar la sesión
  const sessionResp = await redisDel(sessionKey);

  if (!sessionResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace('<operation>', 'del'),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  return res.json(
    createResponse(true, ACTIONS_CONTINUE, null, null, AUTH_CONTROLLER_CODE),
  );
};
