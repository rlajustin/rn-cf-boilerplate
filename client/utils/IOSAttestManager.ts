import "react-native-get-random-values";
import * as AppAttest from "react-native-ios-appattest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import stringify from "json-stable-stringify";
import { Sha256 } from "@aws-crypto/sha256-js";
import { apiClient } from "./api-util";
import { Buffer } from "buffer";
import { AllEndpoints } from "shared";
const KEY_ID_KEY = "publicKeyId";
const ATTEST_EXPIRATION_KEY = "attestExpiration";
const DEBUG = true;

async function getSHA256(data: string): Promise<Uint8Array> {
  const hash = new Sha256();
  hash.update(data);
  return await hash.digest();
}

function parseUUIDV4(uuid: string): Uint8Array {
  const hexString = uuid.split("-").join("");
  return new Uint8Array(Buffer.from(hexString, "hex"));
}

class IOSAttestManager {
  private initialized: boolean = false;
  private supported: boolean = false;
  private keyId: string | null = null;
  private controller: AbortController = new AbortController();

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.supported = await AppAttest.attestationSupported();
    try {
      this.keyId = await AsyncStorage.getItem(KEY_ID_KEY);
    } catch (error) {
      console.error("Unexpected error during init", error);
      // Treat it like keyId is not available.
      this.keyId = null;
    }
    this.initialized = true;
  }

  async destroy(): Promise<void> {
    this.controller.abort();
    this.initialized = false;
    this.supported = false;
    this.keyId = null;
  }

  attestationSupported(): boolean {
    this.ensureInitialized();
    return this.supported;
  }

  isKeyRegistered(): boolean {
    this.ensureInitialized();
    return this.keyId !== null;
  }

  async prepareAndRegisterKey(): Promise<boolean> {
    try {
      this.ensureInitialized();
      if (this.isKeyRegistered()) {
        return true;
      }
      const newKeyId = await AppAttest.generateKeys();
      const attestRequestId = uuid.v4();
      const serverChallenge = await apiClient.get({
        endpointName: "GET_ATTESTATION_CHALLENGE",
        signal: this.controller.signal,
        options: { requestId: attestRequestId },
      });
      if (!serverChallenge) {
        throw new Error("Failed to get server challenge");
      }
      const uuidBytes = parseUUIDV4(serverChallenge.nonce);
      const challengeHash = await getSHA256(Buffer.from(uuidBytes).toString("hex"));
      const challengeHashBase64 = Buffer.from(challengeHash).toString("base64");

      const attestationBase64 = await AppAttest.attestKeys(newKeyId, challengeHashBase64);

      const success = await apiClient.post({
        endpointName: "REGISTER_APP_ATTEST_KEY",
        signal: this.controller.signal,
        body: {
          keyId: newKeyId,
          attestationBase64,
        },
        options: { requestId: attestRequestId },
      });
      if (!success) {
        throw new Error("Failed to attest device");
      }

      await Promise.all([
        AsyncStorage.setItem(KEY_ID_KEY, newKeyId),
        AsyncStorage.setItem(ATTEST_EXPIRATION_KEY, (Date.now() + 1000 * 60 * 60 * 24 * 30).toString()),
      ]);
      this.keyId = newKeyId;
      return true;
    } catch (error) {
      console.error("Unexpected error during key registration", error);
      return false;
    }
  }

  // only accepts endpoints which take attestationNonce in the body
  async makeAttestedPostRequest<T extends keyof typeof AllEndpoints>(
    endpointName: T,
    body: InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>> & { attestationNonce?: string }
  ): Promise<boolean> {
    try {
      this.ensureInitialized();
      if (this.keyId === null) {
        throw new Error("No key available! Must prepare and register a key first!");
      }

      const attestExpiration = await AsyncStorage.getItem(ATTEST_EXPIRATION_KEY);
      if (attestExpiration && Date.now() > parseInt(attestExpiration)) {
        await this.prepareAndRegisterKey();
        await new Promise((resolve) => setTimeout(resolve, 500)); // todo get rid of this
      }

      const attestRequestId = uuid.v4();
      const serverChallenge = await apiClient.post({
        endpointName: "GET_ATTESTATION_CHALLENGE",
        signal: this.controller.signal,
        options: { requestId: attestRequestId },
      });
      if (!serverChallenge) {
        throw new Error("Failed to get server challenge");
      }
      // Include server nonce in request body to make it unique.
      body.attestationNonce = serverChallenge.nonce;
      const bodyString = stringify(body);
      if (!bodyString) {
        throw new Error("Failed to stringify body");
      }
      const clientDataHash = await getSHA256(bodyString);
      const clientDataHashBase64 = Buffer.from(clientDataHash).toString("base64");
      const clientAttestationBase64 = await AppAttest.attestRequestData(clientDataHashBase64, this.keyId);
      if (DEBUG) {
        console.log(`body to attest: ${bodyString}`);
        console.log(`clientDataHashBase64: ${clientDataHashBase64}`);
        console.log(`clientAttestationBase64: ${clientAttestationBase64}`);
      }
      const resBody = await apiClient.post({
        endpointName,
        signal: this.controller.signal,
        body,
        options: { requestId: attestRequestId, clientAttestationBase64 },
      });
      if (!resBody) {
        throw new Error("Failed to make attested request");
      }
      return true;
    } catch (error) {
      console.error("Unexpected error during makeAttestedRequest", error);
      return false;
    }
  }

  async deleteKey(): Promise<boolean> {
    this.ensureInitialized();
    try {
      await AsyncStorage.removeItem(KEY_ID_KEY);
      this.keyId = null;
      return true;
    } catch (error) {
      console.error("Unexpected error during deleteKey", error);
      return false;
    }
  }

  private ensureInitialized() {
    if (!this.initialized) {
      throw new Error("Must call initialize() before this API");
    }
  }
}

export default new IOSAttestManager();
