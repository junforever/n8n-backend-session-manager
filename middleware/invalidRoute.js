export const invalidRoute = (req, res) => {
  res.status(404).json({ valid: false, error: 'Ruta no encontrada' });
};
