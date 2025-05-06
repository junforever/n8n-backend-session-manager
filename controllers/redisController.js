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

export const redisGet = async (key) => {
  try {
    const value = await redisClient.get(key);
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
