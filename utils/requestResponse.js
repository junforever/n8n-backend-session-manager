export const createResponse = (
  success,
  action,
  data = null,
  log = null,
  code = null,
) => {
  return {
    success, // Indica si la operación fue exitosa
    action, // Indica que acción tomar en n8n
    data, // Contiene los datos de la respuesta/error
    log, // Mensaje de log para las notificaciones por telegram al administrador
    code, // Codigo para identificar mas facilmente desde donde viene la respuesta/error
  };
};
