import { dateTimeEcuador } from '../utils/dateTimeEcuador.js';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const timestamp = dateTimeEcuador();

// Configurar el transporte para winston-daily-rotate-file
const transport = new DailyRotateFile({
  filename: 'logs/errors-%DATE%.log', // Patrón de nombre de archivo
  datePattern: 'YYYY-MM-DD', // Rotación diaria
  zippedArchive: true, // Comprimir archivos en formato .gz
  maxSize: '10m', // Tamaño máximo: 10 megas
  maxFiles: '7d', // Retener solo los últimos 7 días
});

// Crear el logger con el transporte configurado
const logger = winston.createLogger({
  level: 'error', // Nivel de log (solo errores)
  format: winston.format.json(), // Los logs se guardarán en formato JSON

  transports: [
    // guardar en archivos de transporte
    transport,
    // guardar en consola
    new winston.transports.Console(),
  ],
});

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

    // Guardar el log solo si hay un error (status >= 400)
    if (res.statusCode >= 400) {
      //console.log(JSON.stringify(log));
      logger.error(log); // Registrar error en el archivo
    }
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
      //console.log(JSON.stringify(log));
      logger.error(log); // Registrar error en el archivo
    }
  });

  next();
}
