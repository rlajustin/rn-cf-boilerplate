import { adapterConfig } from "@configs";

export const getEmailVerificationCode = async (kv: KVNamespace, authId: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.EmailVerificationCode, authId);
  return await kv.get(key);
};

export const deleteEmailVerificationCode = async (kv: KVNamespace, authId: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.EmailVerificationCode, authId);
  await kv.delete(key);
};

export const storeEmailVerificationCode = async (kv: KVNamespace, authId: string, mfaCode: string) => {
  await kv.put(adapterConfig.getKVKey(adapterConfig.BaseKVKey.EmailVerificationCode, authId), mfaCode, {
    expirationTtl: 60 * 60 * 24,
  });
};

export const getEmailVerificationCodeAttempts = async (kv: KVNamespace, authId: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.EmailVerificationCodeAttempts, authId);
  const stored = await kv.get(key);
  return stored ? Number(stored) : 0;
};

export const setEmailVerificationCodeAttempts = async (kv: KVNamespace, authId: string, count: number) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.EmailVerificationCodeAttempts, authId);
  await kv.put(key, String(count), { expirationTtl: 60 * 60 * 24 });
};

export const getPasswordResetAttempts = async (kv: KVNamespace, email: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.PasswordResetCodeAttempts, email);
  const stored = await kv.get(key);
  return stored ? Number(stored) : 0;
};

export const setPasswordResetAttempts = async (kv: KVNamespace, email: string, count: number) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.PasswordResetCodeAttempts, email);
  await kv.put(key, String(count), { expirationTtl: 60 * 60 * 24 });
};

export const setAttestationNonce = async (kv: KVNamespace, clientId: string, requestId: string, nonce: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.AttestationNonce, clientId, requestId);
  await kv.put(key, nonce, { expirationTtl: 1800 });
};

export const getAttestationNonce = async (kv: KVNamespace, clientId: string, requestId: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.AttestationNonce, clientId, requestId);
  return await kv.get(key);
};

export const deleteAttestationNonce = async (kv: KVNamespace, clientId: string, requestId: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.AttestationNonce, clientId, requestId);
  await kv.delete(key);
};

export const setAppAttestKey = async (kv: KVNamespace, clientId: string, publicKeyPem: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.AppAttestKey, clientId);
  await kv.put(key, publicKeyPem, { expirationTtl: 60 * 60 * 24 * 30 }); // 30 days
};

export const getAppAttestKey = async (kv: KVNamespace, clientId: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.AppAttestKey, clientId);
  return await kv.get(key);
};
