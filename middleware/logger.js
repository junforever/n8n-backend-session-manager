export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      time: new Date().toISOString(),
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.body?.userId || 'N/A',
    };
    console.log(JSON.stringify(log));
  });

  //registra el evento si la conexión se cerró antes de enviar una respuesta
  res.on('close', () => {
    // Solo registramos si 'finish' no se ha disparado
    if (!res.writableEnded) {
      const duration = Date.now() - start;
      const log = {
        time: new Date().toISOString(),
        method: req.method,
        route: req.originalUrl,
        status: 'N/A', // No hay código de estado porque la respuesta no se envió
        duration: `${duration}ms`,
        userId: req.body?.userId || 'N/A',
        error: 'Connection closed before response was sent',
      };
      console.log(JSON.stringify(log));
    }
  });

  next();
}
