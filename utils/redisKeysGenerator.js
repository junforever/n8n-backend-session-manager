export const redisKeysGenerator = (clientId, uniqueId) => {
  const loginKey = `${clientId}:${uniqueId}:login`;
  const blockUserKey = `${clientId}:${uniqueId}:block`;
  return { loginKey, blockUserKey };
};
