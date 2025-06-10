export enum BaseKVKey {
  JwtPublicSecret = "jwtPublicSecret",
  DeprecatedJwtPublicSecret = "deprecatedJwtPublicSecret",
  JwtPrivateSecret = "jwtPrivateSecret",
  DeprecatedJwtPrivateSecret = "deprecatedJwtPrivateSecret",
  SessionSecret = "sessionSecret",
  RefreshToken = "RT",
  EmailVerificationCode = "EVC",
  EmailVerificationCodeAttempts = "EVA",
  NumEmailVerificationCodes = "NEVC",
  ChangeEmailCode = "CEC",
  ChangeEmailCodeAttempts = "CEA",
  PasswordResetCode = "PRC",
  PasswordResetCodeAttempts = "PRCA",
  FailedLoginAttempts = "FLA",
  AttestationNonce = "AN",
  AppAttestKey = "AAK",
}

export const getKVKey = (base: BaseKVKey, key1: string, key2?: string): string => {
  const baseKey = `${base}-${key1}`;
  return key2 ? `${baseKey}-${key2}` : baseKey;
};
