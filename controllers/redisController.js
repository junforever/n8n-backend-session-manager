import { redisClient } from '../redis/redisClient.js';

//ttl valor en minutos
export const redisSet = async (key, value, ttl = null) => {
  const expiration =
    ttl && !isNaN(ttl) && ttl > 0
      ? {
          type: 'EX',
          value: ttl * 60,
        }
      : null;

  try {
    await redisClient.set(key, value, {
      expiration,
      condition: 'NX',
    });
    return { success: true, data: null };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

//Establecer valor como string de una clave de un hash con un ttl en minutos
export const redisHSet = async (key, field, value, ttl = null) => {
  try {
    const expiration =
      ttl && !isNaN(ttl) && ttl > 0 ? (ttl * 60).toString() : null;
    console.log(expiration);
    await redisClient.hSet(key, field, value);
    await redisClient.sendCommand([
      'HEXPIRE',
      key,
      expiration,
      'NX',
      'FIELDS',
      '1',
      field,
    ]);
    return { success: true, data: null };
  } catch (error) {
    console.log(error);
    return { success: false, data: error.message };
  }
};

//obtener valor string de una clave
export const redisGet = async (key) => {
  try {
    const value = await redisClient.get(key);
    return { success: true, data: value };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

//obtener valor de una propiedad de un hash
export const redisHGet = async (key, field) => {
  try {
    const value = await redisClient.hGet(key, field);
    return { success: true, data: value };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

//obtener el objeto completo (hash) de una clave
export const redisHGetAll = async (key) => {
  try {
    const value = await redisClient.hGetAll(key);
    return { success: true, data: value };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const redisDel = async (key) => {
  try {
    await redisClient.del(key);
    return { success: true, data: null };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

//Eliminar valor de la clave de un hash
export const redisHDel = async (key, field) => {
  try {
    await redisClient.sendCommand(['HDEL', key, field]);
    return { success: true, data: null };
  } catch (error) {
    console.log(error);
    return { success: false, data: error.message };
  }
};
