export const redisKeysGenerator = (clientId, uniqueId) => {
  const revokedKey = `${clientId}:${uniqueId}:revoked`;
  const sessionKey = `${clientId}:${uniqueId}:session`;
  const loginKey = `${clientId}:${uniqueId}:login`;
  const blockUserKey = `${clientId}:${uniqueId}:block`;
  return { revokedKey, sessionKey, loginKey, blockUserKey };
};
