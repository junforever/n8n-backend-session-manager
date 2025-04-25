import { dateTimeEcuador } from './dateTimeEcuador.js';

export const createResponse = (success, action, data = null) => {
  return {
    success, // Indica si la operación fue exitosa
    action, // Indica que acción tomar en n8n
    data, // Contiene los datos de la respuesta/error
    timestamp: dateTimeEcuador(), // Marca temporal para la respuesta
  };
};
