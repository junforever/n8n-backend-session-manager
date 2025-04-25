import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import { createResponse } from '../utils/requestRespose.js';

const cache = new NodeCache();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_super_secreta';

export const root = (req, res) => {
  res.json(
    createResponse(
      true,
      process.env.ACTIONS_DO_NOTHING,
      'Welcome to n8n backend api management',
    ),
  );
};

export const generateToken = (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role)
    return res.status(400).json({ error: 'userId y role requeridos' });

  const payload = {
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 15 * 60,
  };

  const token = jwt.sign(payload, JWT_SECRET);
  cache.set(`token_${userId}`, token, 15 * 60);

  res.json({ token });
};

export const verifyToken = (req, res) => {
  const { token } = req.body;
  if (!token)
    return res.status(400).json({ valid: false, error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const cached = cache.get(`token_${decoded.userId}`);

    if (!cached || cached !== token) {
      return res
        .status(401)
        .json({ valid: false, error: 'Token no coincide o expirado' });
    }

    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Token inválido o expirado' });
  }
};
