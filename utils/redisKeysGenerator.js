export const redisKeysGenerator = (clientId, uniqueId) => {
  const revokedKey = `${clientId}:${uniqueId}:revoked`;
  const loginKey = `${clientId}:${uniqueId}:login`;
  const blockUserKey = `${clientId}:${uniqueId}:block`;
  return { revokedKey, loginKey, blockUserKey };
};
