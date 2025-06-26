import { Sha256 } from "@aws-crypto/sha256-js";

function arrayBufferToBase64(buffer: Uint8Array): string {
  const binary = Array.from(buffer)
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return btoa(binary);
}

export function hashPassword(password: string): string {
  const hash = new Sha256();
  hash.update(password);
  const hashBytes = hash.digestSync();
  return arrayBufferToBase64(hashBytes);
}
