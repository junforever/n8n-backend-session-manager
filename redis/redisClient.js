import { createClient } from 'redis';
import { errors } from '../i18n/errors.js';
import { logger } from '../middleware/logger.js';
import { dateTimeEcuador } from '../utils/dateTimeEcuador.js';

const timestamp = dateTimeEcuador();

export const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('error', (error) =>
  logger.error({
    time: timestamp,
    message: errors.redisError.log_es,
    error,
  }),
);

// Conexión a Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Conexión exitosa a Redis');
  } catch (error) {
    logger.error({ time: timestamp, message: errors.redisError.log_es, error });
    process.exit(1);
  }
})();
