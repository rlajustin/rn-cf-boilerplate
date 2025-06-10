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

export const storePasswordResetCode = async (kv: KVNamespace, authId: string, code: string) => {
  await kv.put(adapterConfig.getKVKey(adapterConfig.BaseKVKey.PasswordResetCode, authId), code, {
    expirationTtl: 5 * 60,
  });
};

export const getPasswordResetCode = async (kv: KVNamespace, authId: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.PasswordResetCode, authId);
  return await kv.get(key);
};

export const deletePasswordResetCode = async (kv: KVNamespace, authId: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.PasswordResetCode, authId);
  await kv.delete(key);
};

export const getPasswordResetAttemptsByIP = async (kv: KVNamespace, email: string, ip?: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.PasswordResetCodeAttempts, email, ip);
  const stored = await kv.get(key);
  return stored ? Number(stored) : 0;
};

export const setPasswordResetAttemptsByIP = async (
  kv: KVNamespace,
  email: string,
  ip: string | undefined,
  count: number
) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.PasswordResetCodeAttempts, email, ip);
  await kv.put(key, String(count), { expirationTtl: 86400 });
};

export const getFailedLoginAttempts = async (kv: KVNamespace, email: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.FailedLoginAttempts, email);
  const stored = await kv.get(key);
  return stored ? Number(stored) : 0;
};

export const setFailedLoginAttempts = async (kv: KVNamespace, email: string, count: number, expiresIn: number) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.FailedLoginAttempts, email);
  await kv.put(key, String(count), { expirationTtl: expiresIn });
};

export const incrementFailedLoginAttempts = async (kv: KVNamespace, email: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.FailedLoginAttempts, email);
  const attempts = await getFailedLoginAttempts(kv, email);
  await kv.put(key, String(attempts + 1), { expirationTtl: 5 * 60 }); // 5 minutes
  return attempts + 1;
};

export const resetFailedLoginAttempts = async (kv: KVNamespace, email: string) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.FailedLoginAttempts, email);
  await kv.delete(key);
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
