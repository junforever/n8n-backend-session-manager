import { createResponse } from '../utils/requestResponse.js';
import {
  ACTIONS_DO_NOTHING,
  RATE_LIMIT_CONTROLLER_CODE,
} from '../constants/constants.js';

/**
 * Controlador para verificar el estado del rate limit
 * Esta función simplemente retorna una respuesta exitosa si el rate limit permite la solicitud
 */
export const checkRateLimit = (req, res) => {
  // Si llegamos hasta aquí, significa que el rate limit permitió la solicitud
  res.json(
    createResponse(
      true,
      ACTIONS_DO_NOTHING,
      RATE_LIMIT_CONTROLLER_CODE,
      'Request within rate limit',
    ),
  );
};
