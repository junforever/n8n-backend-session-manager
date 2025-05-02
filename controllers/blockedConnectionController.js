import { redisClient } from '../redis/redisClient.js';

export const verifyBlockedConnection = async (uniqueId) => {
  try {
    const isBlocked = await redisClient.get(`block_${uniqueId}`);
    return { success: true, data: !!isBlocked };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const addBlockedConnection = async (uniqueId) => {
  const blockExpirationMinutes = process.env.BLOCK_EXPIRATION_MINUTES || 60;
  try {
    await redisClient.set(`block_${uniqueId}`, 'true', {
      expiration: {
        type: 'EX',
        value: blockExpirationMinutes * 60,
      },
      condition: 'NX',
    });
    return { success: true, data: null };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const removeBlockedConnection = async (uniqueId) => {
  try {
    await redisClient.del(`block_${uniqueId}`);
    return { success: true, data: null };
  } catch (error) {
    return { success: false, data: error.message };
  }
};
