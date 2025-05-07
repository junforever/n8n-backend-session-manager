import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
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
  redisHGet,
  redisHDel,
  redisHGetAll,
  redisHSet,
} from './redisController.js';
import { redisKeysGenerator } from '../utils/redisKeysGenerator.js';

const tokenField = 'token';

/**
 * Genera un token de autenticación para el usuario que se loguea.
 *
 * @param {string} uniqueId Identificador único del usuario.
 * @param {number} ttl Tiempo de vida del token en minutos.
 * @returns {string} El token de autenticación.
 */

const generateToken = (uniqueId, ttl) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const payload = {
    uniqueId,
    exp: currentTime + ttl * 60,
  };

  return jwt.sign(payload, JWT_SECRET);
};

/**
 * Inicia sesión de un usuario registrado.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Object} - Objeto de respuesta con el token de autenticación.
 */
export const login = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { password: passwordBody } = req.body;
  const { loginKey } = redisKeysGenerator(clientId, uniqueId);
  const ttl = parseInt(process.env.JWT_EXPIRATION_MINUTES);

  //obtener informacion del usuario registrado
  const passwordResp = await redisHGet(loginKey, 'password');
  if (!passwordResp.success) {
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

  const password = passwordResp.data;
  try {
    const match = await argon2.verify(password, passwordBody);
    //verificar si la contraseña es correcta
    if (!match) {
      return res.json(
        createResponse(
          true,
          ACTIONS_CHAT_NOTIFICATION,
          errors.invalidPasswordError[lang],
          null,
          AUTH_CONTROLLER_CODE,
        ),
      );
    }
  } catch (error) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.internalServerError[lang],
          `${errors.internalServerError.log_es} ${error}`,
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  //generar el token
  const token = generateToken(uniqueId, ttl);

  //crear el registro de inicio de sesión en la clave login del usuario
  const setTokenField = await redisHSet(loginKey, tokenField, token, ttl);

  if (!setTokenField.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'hset login token',
          ),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  res.json(
    createResponse(true, ACTIONS_CONTINUE, token, null, AUTH_CONTROLLER_CODE),
  );
};

/**
 * Verifica que el token de sesión sea válido.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Object} - Objeto de respuesta con la información del usuario.
 */
export const verifySessionToken = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { token: bodyToken } = req.body;
  const { loginKey } = redisKeysGenerator(clientId, uniqueId);

  //En este punto el token ENVIADO EN EL BODY ya fue previamente validado por validateRequestBodyVerifyJwt
  //se validó que exista en el body, que sea un token jwt válido y que no este revocado
  //Por lo tanto solo se verifica que el token exista en redis en el hash del login
  const sessionTokenResp = await redisHGetAll(loginKey);

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

  const { name, lastName, isOwner, phone, role, email, token } =
    sessionTokenResp.data;

  if (!token || token !== bodyToken) {
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
      { name, lastName, isOwner, phone, role, email, token },
      null,
      AUTH_CONTROLLER_CODE,
    ),
  );
};

/**
 * Cierra la sesión del usuario eliminando el campo token del hash login
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const logout = async (req, res) => {
  const { lang, uniqueId, clientId, sessionExp } = req;
  const { token } = req.body;
  const { loginKey } = redisKeysGenerator(clientId, uniqueId);

  // Definir un TTL 5 minutos mayor al tiempo de sesión restante
  // se divide para 60 porque el redisSet espera un valor en minutos
  const revokeTTL = (sessionExp - Math.floor(Date.now() / 1000) + 5 * 60) / 60;

  // Guardar el token revocado en redis con su TTL
  const revokeResp = await redisSet(token, 'true', revokeTTL);

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
  const sessionResp = await redisHDel(loginKey, tokenField);

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

/**
 * Valida si el usuario es un cliente o un usuario registrado.
 * Si es un usuario registrado:
 * - se valida que este activo
 * - se verifica si tiene una sesion activa
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const validateRequest = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { loginKey } = redisKeysGenerator(clientId, uniqueId);

  //validar si es un usuario registrado
  const loginResp = await redisHGet(loginKey, 'isActive');
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
  const isActive = loginResp.data;
  if (!parseInt(isActive)) {
    return res.json(
      createResponse(
        true,
        ACTIONS_CHAT_NOTIFICATION,
        errors.userInactiveError[lang],
        null,
        AUTH_CONTROLLER_CODE,
      ),
    );
  }

  //verificar si el usuario tiene una sesion activa
  const sessionResp = await redisHGet(loginKey, tokenField);
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

/**
 * Bloquea un usuario.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
export const blockUser = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { blockUserKey } = redisKeysGenerator(clientId, uniqueId);

  //bloquear el usuario
  const blockResp = await redisSet(blockUserKey, 'block', 'true');

  if (!blockResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'set block user',
          ),
          AUTH_CONTROLLER_CODE,
        ),
      );
  }

  return res.json(
    createResponse(true, ACTIONS_CONTINUE, null, null, AUTH_CONTROLLER_CODE),
  );
};
