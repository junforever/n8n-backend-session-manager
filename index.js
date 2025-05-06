import express from 'express';
import timeout from 'connect-timeout';

import { authRouter } from './routes/authRouter.js';
import { sanitizeRouter } from './routes/sanitizeRouter.js';
import { rootRouter } from './routes/rootRouter.js';

import { requestLogger } from './middleware/logger.js';
import { limiter } from './middleware/rateLimit.js';
import { requestTimeOut, haltOnTimedout } from './middleware/timeOut.js';
import { sanitizeRequest } from './middleware/sanitizeRequest.js';
import { jsonErrorHandler } from './middleware/jsonErrorHandler.js';
import { invalidRoute } from './middleware/invalidRoute.js';
import { languageValidation } from './middleware/languageValidation.js';
import { validateConnectionToken } from './middleware/validateConnectionToken.js';
import { validateRequestHeaders } from './middleware/validateRequestHeaders.js';
import { validateBlockedConnections } from './middleware/validateBlockedConnections.js';

const app = express();

const PORT = process.env.PORT || 3000;

// Deshabilitar el encabezado x-powered-by
app.disable('x-powered-by');

// Middleware para logging
app.use(requestLogger);

// Middleware para validar el token de conexión
app.use(validateConnectionToken);

// Middleware para validar los encabezados requeridos
app.use(validateRequestHeaders);

// Middleware para validar las conexiones bloqueadas
app.use(validateBlockedConnections);

// Middleware para controlar el limite de peticiones por usuario
app.use(limiter);

// Middleware para controlar el tiempo maximo de espera por cada petición
app.use(timeout(process.env.REQUEST_TIMEOUT || '15s'));

// Middleware para detener el procesamiento de solicitudes con timeout
app.use(haltOnTimedout);

// Middleware para manejar errores de timeout
app.use(requestTimeOut);

// Middleware para controlar el tamaño maximo del body
app.use(
  express.json({
    limit: process.env.REQUEST_MAX_BODY_SIZE || '1mb',
    strict: true,
  }),
);

// Middleware para validar que se envie un idioma soportado
app.use(languageValidation);

// Middleware para manejar errores JSON
app.use(jsonErrorHandler);

// Middleware para sanitizar todo lo que llega por body
app.use(sanitizeRequest);

// Middleware para manejo de rutas de root
app.use('/', rootRouter);

// Middleware para manejo de rutas de autenticacion
app.use('/auth', authRouter);

// Middleware para manejo de rutas de sanitizacion
app.use('/sanitize', sanitizeRouter);

// Middleware para rutas invalidas
app.use(invalidRoute);

app.listen(PORT, () => {
  console.log(`JWT Backend running on http://localhost:${PORT}`);
});
