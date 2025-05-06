export const redisKeysGenerator = (uniqueId, clientId) => {
  const revokedKey = `${uniqueId}_${clientId}_revoked`;
  const sessionKey = `${uniqueId}_${clientId}_session`;
  const loginKey = `${uniqueId}_${clientId}_login`;
  const blockUserKey = `${uniqueId}_${clientId}_block`;
  return { revokedKey, sessionKey, loginKey, blockUserKey };
};
