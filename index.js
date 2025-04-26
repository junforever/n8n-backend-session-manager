import express from 'express';
import timeout from 'connect-timeout';
import dotenv from 'dotenv';

import { authRouter } from './routes/authRouter.js';

//import { detectLanguage } from './language';
import { requestLogger } from './middleware/logger.js';
import { limiter } from './middleware/rateLimit.js';
import { requestTimeOut, haltOnTimedout } from './middleware/timeOut.js';
import { sanitizeRequest } from './middleware/sanitizeRequest.js';
import { invalidRoute } from './middleware/invalidRoute.js';
import { jsonErrorHandler } from './middleware/jsonErrorHandler.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware para controlar el tiempo maximo de espera por cada petición
app.use(timeout(process.env.REQUEST_TIMEOUT || '15s'));

// Middleware para detener el procesamiento de solicitudes con timeout
app.use(haltOnTimedout);

// Middleware para manejar errores de timeout
app.use(requestTimeOut);

// Middleware para controlar el tamaño maximo del body
app.use(express.json({ limit: process.env.REQUEST_MAX_BODY_SIZE || '10kb' }));

// Middleware para controlar el limite de peticiones por usuario
app.use(limiter);

// Middleware para logging
app.use(requestLogger);

// Middleware para manejar errores JSON
app.use(jsonErrorHandler);

// Middleware para sanitizar todo lo que llega por body
app.use(sanitizeRequest);

app.disable('x-powered-by');

// Middleware para manejo de rutas
app.use('/', authRouter);

// Middleware para rutas invalidas
app.use(invalidRoute);

app.listen(PORT, () => {
  console.log(`JWT Backend running on http://localhost:${PORT}`);
});
