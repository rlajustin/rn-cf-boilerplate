import base32Encode from "base32-encode";
import { createHash, createCipheriv, createDecipheriv, randomBytes } from "crypto";

export async function getSHA256(data: Buffer): Promise<Buffer> {
  const hash = createHash("sha256");
  hash.update(data);
  return hash.digest();
}

export const genRandom6DigitString = (): string => {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 36)
      .toString(36)
      .toUpperCase()
  ).join("");
};

const genRandomBytes = (length: number) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};

export const genOtpSecret = () => {
  const secret = genRandomBytes(20);
  const base32Secret = base32Encode(secret, "RFC4648");
  return base32Secret;
};

/**
 * Encrypts text using AES-256-GCM with the JWT secret
 * Returns format: iv:ciphertext:authTag (all hex encoded)
 */
export const encryptString = (text: string, jwtSecret: string): string => {
  // Derive a 32-byte key from the JWT secret using SHA-256
  const key = createHash("sha256").update(jwtSecret).digest();

  // Generate a random IV
  const iv = randomBytes(12);

  // Create cipher
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  // Encrypt the text
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get the auth tag
  const authTag = cipher.getAuthTag();

  // Combine IV, ciphertext, and auth tag
  return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
};

/**
 * Decrypts text that was encrypted with encryptText
 * Expects format: iv:ciphertext:authTag (all hex encoded)
 */
export const decryptString = (encryptedText: string, jwtSecret: string): string => {
  // Split the components
  const [ivHex, encrypted, authTagHex] = encryptedText.split(":");
  if (!ivHex || !encrypted || !authTagHex) {
    throw new Error("Invalid encrypted text format");
  }

  // Derive the key from JWT secret
  const key = createHash("sha256").update(jwtSecret).digest();

  // Create decipher
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));

  // Set auth tag
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  // Decrypt
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

export const hashString = (input: string): string => {
  return createHash("sha256").update(input).digest("hex");
};
