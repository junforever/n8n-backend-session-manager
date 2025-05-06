import jwt from 'jsonwebtoken';
import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  ACTIONS_CONTINUE,
  AUTH_CONTROLLER_CODE,
  ACTIONS_CHAT_NOTIFICATION,
  JWT_SECRET,
} from '../constants/constants.js';
import { errors } from '../i18n/errors.js';
import {
  redisSet,
  redisGet,
  redisDel,
  redisHGetAll,
} from './redisController.js';
import { redisKeysGenerator } from '../utils/redisKeysGenerator.js';

export const generateToken = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { password: passwordBody } = req.body;
  const { sessionKey, loginKey } = redisKeysGenerator(clientId, uniqueId);
  const ttl = parseInt(process.env.JWT_EXPIRATION_MINUTES) * 60;

  //obtener informacion del usuario registrado
  const loginResp = await redisHGetAll(loginKey);
  if (!loginResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'get login data',
          ),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  const { name, lastName, email, phone, role, isOwner, password } =
    loginResp.data;
  //verificar si la contraseña es correcta
  if (passwordBody !== password) {
    return res
      .status(200)
      .json(
        createResponse(
          true,
          ACTIONS_CHAT_NOTIFICATION,
          errors.invalidPasswordError[lang],
          errors.invalidPasswordError.log_es,
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  const payload = {
    uniqueId,
    name,
    lastName,
    role,
    email,
    phone,
    isOwner,
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
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'set session',
          ),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  res.json(
    createResponse(true, ACTIONS_CONTINUE, token, null, AUTH_CONTROLLER_CODE),
  );
};

export const verifySessionToken = async (req, res) => {
  const { lang, uniqueId, clientId, role, name } = req;
  const { token } = req.body;
  const { sessionKey } = redisKeysGenerator(clientId, uniqueId);

  //En este punto el token ya fue previamente validado por validateRequestBodyVerifyJwt
  //Por lo tanto solo se verifica que el token exista en redis
  const sessionTokenResp = await redisGet(sessionKey);

  if (!sessionTokenResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'get session',
          ),
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
  const { lang, uniqueId, clientId, exp } = req;
  const { token } = req.body;
  const { revokedKey, sessionKey } = redisKeysGenerator(clientId, uniqueId);

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
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'set revoked',
          ),
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
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'del session',
          ),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  return res.json(
    createResponse(true, ACTIONS_CONTINUE, null, null, AUTH_CONTROLLER_CODE),
  );
};

//validar si es un usuario registrado o un cliente
//si es un usuario registrado:
// - se valida que este activo
// - se verifica si tiene una sesion activa
export const validateUser = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { loginKey, sessionKey } = redisKeysGenerator(clientId, uniqueId);

  //validar si es un usuario registrado
  const loginResp = await redisHGetAll(loginKey);
  if (!loginResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace('<operation>', 'get login'),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  //es un cliente
  if (!loginResp.data) {
    return res.json(
      createResponse(true, ACTIONS_CONTINUE, null, null, AUTH_CONTROLLER_CODE),
    );
  }

  //verificar que el usuario este activo
  const { isActive } = loginResp.data;
  if (!parseInt(isActive)) {
    return res
      .status(200)
      .json(
        createResponse(
          true,
          ACTIONS_CHAT_NOTIFICATION,
          errors.userInactiveError[lang],
          errors.userInactiveError.log_es,
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  //verificar si el usuario tiene una sesion activa
  const sessionResp = await redisGet(sessionKey);
  if (!sessionResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'get active session',
          ),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  //retorno el token de la sesion, si el token es null significa que es un usuario pero no tiene sesion activa
  if (sessionResp.data) {
    return res.json(
      createResponse(
        true,
        ACTIONS_CONTINUE,
        { token: sessionResp.data },
        null,
        AUTH_CONTROLLER_CODE,
      ),
    );
  }
};
