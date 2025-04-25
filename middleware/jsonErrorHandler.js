export const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res
      .status(400)
      .json({ data: null, error: 'Formato JSON inválido en la petición' });
  }
  return res
    .status(500)
    .json({ data: null, error: 'Error interno del servidor' });
};
