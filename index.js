// jwt-backend-session/index.js
import express from 'express';
import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import timeout from 'connect-timeout';
import dotenv from 'dotenv';
import { authRouter } from './routes/authRouter';

//import { detectLanguage } from './language';
import { requestLogger } from './middleware/logger';
import { limiter } from './middleware/rateLimit';
import { requestTimeOut } from './middleware/timeOut';
import { sanitizeRequest } from './middleware/sanitizeRequest';
import { invalidRoute } from './middleware/invalidRoute';
import { jsonErrorHandler } from './middleware/jsonErrorHandler';

dotenv.config();

const app = express();
const cache = new NodeCache();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_super_secreta';

// Middleware para controlar el tiempo maximo de espera por cada petición
app.use(timeout('15s'));

// Middleware para controlar el tamaño maximo del body
app.use(express.json({ limit: '10kb' }));

// Middleware para controlar el limite de peticiones por usuario
app.use(limiter);

// Middleware para logging
app.use(requestLogger);

// Middleware para manejar errores de timeout
app.use(requestTimeOut);

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
  console.log(`JWT Backend corriendo en http://localhost:${PORT}`);
});
