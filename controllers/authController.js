import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_CHAT_ALERT_NOTIFICATION,
  ACTIONS_CONTINUE,
  AUTH_CONTROLLER_CODE,
  ACTIONS_CHAT_NOTIFICATION,
  ACTIONS_INVALID_PASSWORD_NOTIFICATION,
  ACTIONS_BLOCKED_USER_NOTIFICATION,
  JWT_SECRET,
} from '../constants/constants.js';
import { errors } from '../i18n/errors.js';
import {
  redisSet,
  redisHGet,
  redisHDel,
  redisHGetAll,
  redisHSet,
  redisHIncr,
} from './redisController.js';
import { redisKeysGenerator } from '../utils/redisKeysGenerator.js';

const tokenField = 'token';
const attemptsField = 'attempts';

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

const loginManager = async (
  loginKey,
  passwordBody,
  uniqueId,
  lang,
  loginAttempts = false,
) => {
  const ttl = parseInt(process.env.JWT_EXPIRATION_MINUTES);
  const resp = {
    code: 200,
    data: null,
  };
  //obtener informacion del usuario registrado
  const passwordResp = await redisHGet(loginKey, 'password');
  if (!passwordResp.success) {
    resp.code = 500;
    resp.data = createResponse(
      false,
      ACTIONS_CHAT_ALERT_NOTIFICATION,
      AUTH_CONTROLLER_CODE,
      null,
      errors.redisOperationError[lang],
      errors.redisOperationError.log_es.replace(
        '<operation>',
        'get login data',
      ),
    );
    return resp;
  }

  const password = passwordResp.data;
  try {
    const match = await argon2.verify(password, passwordBody);
    //verificar si la contraseña es correcta
    if (!match) {
      if (loginAttempts) {
        const attemptsResp = await redisHIncr(
          loginKey,
          attemptsField,
          parseInt(process.env.LOGIN_ATTEMPTS_EXPIRATION_MINUTES) || 60,
        );
        if (!attemptsResp.success) {
          resp.code = 500;
          resp.data = createResponse(
            false,
            ACTIONS_CHAT_ALERT_NOTIFICATION,
            AUTH_CONTROLLER_CODE,
            null,
            errors.redisOperationError[lang],
            errors.redisOperationError.log_es.replace(
              '<operation>',
              'hincrby login attempts',
            ),
          );
          return resp;
        }

        const attempts = attemptsResp.data;

        //si el usuario ha intentado iniciar sesión 5 veces con contraseña incorrecta
        if (attempts >= parseInt(process.env.LOGIN_ATTEMPTS || 5)) {
          resp.code = 423;
          resp.data = createResponse(
            false,
            ACTIONS_BLOCKED_USER_NOTIFICATION,
            AUTH_CONTROLLER_CODE,
            null,
            errors.loginAttemptsError[lang],
          );
          return resp;
        }
        resp.code = 401;
        resp.data = createResponse(
          false,
          ACTIONS_INVALID_PASSWORD_NOTIFICATION,
          AUTH_CONTROLLER_CODE,
          attempts,
          errors.invalidPasswordError[lang],
        );
        return resp;
      }
      resp.code = 401;
      resp.data = createResponse(
        false,
        ACTIONS_INVALID_PASSWORD_NOTIFICATION,
        AUTH_CONTROLLER_CODE,
        null,
        errors.invalidPasswordError[lang],
      );
      return resp;
    }
  } catch (error) {
    resp.code = 500;
    resp.data = createResponse(
      false,
      ACTIONS_CHAT_ALERT_NOTIFICATION,
      AUTH_CONTROLLER_CODE,
      null,
      errors.internalServerError[lang],
      `${errors.internalServerError.log_es} ${error}`,
    );
    return resp;
  }

  if (loginAttempts) {
    // Eliminar los intentos si se ingresó correctamente
    const attempsDelResp = await redisHDel(loginKey, attemptsField);

    if (!attempsDelResp.success) {
      resp.code = 500;
      resp.data = createResponse(
        false,
        ACTIONS_CHAT_ALERT_NOTIFICATION,
        AUTH_CONTROLLER_CODE,
        null,
        errors.redisOperationError[lang],
        errors.redisOperationError.log_es.replace(
          '<operation>',
          'del attempts',
        ),
      );
      return resp;
    }
  }

  //generar el token
  const token = generateToken(uniqueId, ttl);

  //crear el registro de inicio de sesión en la clave login del usuario
  const setTokenField = await redisHSet(loginKey, tokenField, token, ttl);

  if (!setTokenField.success) {
    resp.code = 500;
    resp.data = createResponse(
      false,
      ACTIONS_CHAT_ALERT_NOTIFICATION,
      AUTH_CONTROLLER_CODE,
      null,
      errors.redisOperationError[lang],
      errors.redisOperationError.log_es.replace(
        '<operation>',
        'hset login token',
      ),
    );
    return resp;
  }

  resp.data = createResponse(
    true,
    ACTIONS_CONTINUE,
    AUTH_CONTROLLER_CODE,
    token,
  );
  return resp;
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

  const loginResp = await loginManager(loginKey, passwordBody, uniqueId, lang);

  return res.status(loginResp.code).json(loginResp.data);
};

/**
 * Inicia sesión de un usuario registrado.
 * Verifica además si el usuario ha intentado iniciar sesión 5 veces con contraseñ́a incorrecta.
 *
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Object} - Objeto de respuesta con el token de autenticación.
 */

export const loginMaxAttempts = async (req, res) => {
  const { lang, uniqueId, clientId } = req;
  const { password: passwordBody } = req.body;
  const { loginKey } = redisKeysGenerator(clientId, uniqueId);

  const loginResp = await loginManager(
    loginKey,
    passwordBody,
    uniqueId,
    lang,
    true,
  );

  return res.status(loginResp.code).json(loginResp.data);
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
  const sessionTokenResp = await redisHGet(loginKey, 'token');

  if (!sessionTokenResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          AUTH_CONTROLLER_CODE,
          null,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'get session',
          ),
        ),
      );
  }

  const token = sessionTokenResp.data;

  if (!token || token !== bodyToken) {
    return res
      .status(401)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          AUTH_CONTROLLER_CODE,
          null,
          errors.expiredTokenError[lang],
          errors.expiredTokenError.log_es,
        ),
      );
  }
  res.json(createResponse(true, ACTIONS_CONTINUE, AUTH_CONTROLLER_CODE, true));
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
          AUTH_CONTROLLER_CODE,
          null,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'set revoked',
          ),
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
          AUTH_CONTROLLER_CODE,
          null,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'del session',
          ),
        ),
      );
  }

  return res.json(
    createResponse(true, ACTIONS_CONTINUE, AUTH_CONTROLLER_CODE, true),
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
  const loginResp = await redisHGetAll(loginKey);

  if (!loginResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          AUTH_CONTROLLER_CODE,
          null,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace('<operation>', 'get login'),
        ),
      );
  }

  //es un cliente
  if (!loginResp.data) {
    return res.json(
      createResponse(true, ACTIONS_CONTINUE, AUTH_CONTROLLER_CODE, true),
    );
  }

  //verificar que el usuario este activo
  const { name, lastName, isOwner, phone, role, email, isActive } =
    loginResp.data;
  if (!parseInt(isActive)) {
    return res.json(
      createResponse(
        true,
        ACTIONS_CHAT_NOTIFICATION,
        AUTH_CONTROLLER_CODE,
        null,
        errors.userInactiveError[lang],
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
          AUTH_CONTROLLER_CODE,
          null,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'get active session',
          ),
        ),
      );
  }

  //retorno el token de la sesion, si el token es null significa que es un usuario pero no tiene sesion activa
  return res.json(
    createResponse(true, ACTIONS_CONTINUE, AUTH_CONTROLLER_CODE, {
      token: sessionResp.data,
      name,
      lastName,
      isOwner,
      phone,
      role,
      email,
    }),
  );
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
  const blockResp = await redisSet(
    blockUserKey,
    'true',
    parseInt(process.env.BLOCK_EXPIRATION_MINUTES) || 60,
  );

  if (!blockResp.success) {
    return res
      .status(500)
      .json(
        createResponse(
          false,
          ACTIONS_CHAT_ALERT_NOTIFICATION,
          AUTH_CONTROLLER_CODE,
          null,
          errors.redisOperationError[lang],
          errors.redisOperationError.log_es.replace(
            '<operation>',
            'set block user',
          ),
        ),
      );
  }

  return res.json(
    createResponse(true, ACTIONS_CONTINUE, AUTH_CONTROLLER_CODE, true),
  );
};
