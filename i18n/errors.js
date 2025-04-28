export const errors = {
  sanitizeError: {
    es: 'Hubo un error al sanitizar la petición',
    en: 'There was an error sanitizing the request',
  },
  languageError: {
    es: 'Idioma no válido',
    en: 'Invalid language',
  },
  invalidRouteError: {
    es: 'Ruta no válida',
    en: 'Invalid route',
  },
  jsonError: {
    es: 'Formato JSON no válido',
    en: 'Invalid JSON format',
  },
  internalServerError: {
    es: 'Error en el servidor',
    en: 'Internal server error',
  },
  connectionError: {
    es: 'Conexión cerrada antes de enviar la respuesta',
    en: 'Connection closed before response was sent',
  },
  rateLimitError: {
    es: 'Demasiadas peticiones. Por favor, intente de nuevo más tarde. RetryAfter: <countdown> seg.',
    en: 'Too many requests. Please try again later. RetryAfter: <countdown> sec.',
  },
  timeoutError: {
    es: 'Tiempo de espera excedido. Por favor, intente de nuevo más tarde.',
    en: 'Timeout exceeded. Please try again later.',
  },
  userIdRoleError: {
    es: 'Id de usuario y role son obligatorios',
    en: 'User id and role are required',
  },
  userTokenError: {
    es: 'Datos de inicio de sesión invalidos',
    en: 'Invalid login credentials',
  },
  expiredTokenError: {
    es: 'La sesión a caducado, por favor vuelva a iniciar sesión',
    en: 'Session expired, please log in again',
  },
};
