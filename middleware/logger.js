import { dateTimeEcuador } from '../utils/dateTimeEcuador.js';

export function requestLogger(req, res, next) {
  const start = Date.now();

  // Guardar el método original de res.json
  const originalJson = res.json;

  // Variable para almacenar el cuerpo de la respuesta
  let responseBody = null;

  // Sobrescribir res.json para capturar el cuerpo
  res.json = function (body) {
    responseBody = body; // Almacenar el cuerpo de la respuesta
    return originalJson.call(this, body); // Llamar al método original
  };

  const timestamp = dateTimeEcuador();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      time: timestamp,
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.body?.userId || 'N/A',
      responseData: responseBody?.data || 'N/A', // Capturar el campo data de la respuesta
    };
    console.log(JSON.stringify(log));
  });

  //registra el evento si la conexión se cerró antes de enviar una respuesta
  res.on('close', () => {
    // Solo registramos si 'finish' no se ha disparado
    if (!res.writableEnded) {
      const duration = Date.now() - start;
      const log = {
        time: timestamp,
        method: req.method,
        route: req.originalUrl,
        status: 'N/A', // No hay código de estado porque la respuesta no se envió
        duration: `${duration}ms`,
        userId: req.body?.userId || 'N/A',
        responseData: 'Connection closed before response was sent',
      };
      console.log(JSON.stringify(log));
    }
  });

  next();
}
