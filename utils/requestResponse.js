/*
 * Crea una respuesta para enviar al cliente
 *
 * @param {boolean} success - Indica si la operación fue exitosa
 * @param {string} action - Indica que acción tomar en n8n
 * @param {string} code - Código para identificar mas facilmente desde donde viene la respuesta/error
 * @param {Object} data - Contiene los datos de la respuesta
 * @param {string} message - Mensaje de error para enviar al usuario
 * @param {string} log - Mensaje de log para las notificaciones por chat al administrador
 * @returns {Object} - Objeto de respuesta
 */
export const createResponse = (
  success,
  action,
  code,
  data = null,
  message = null,
  log = null,
) => {
  return {
    success,
    action,
    code,
    data,
    message,
    log,
  };
};
