import "react-native-get-random-values";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { Platform } from "react-native";
import { AllEndpoints } from "shared";

const CLIENT_ID_KEY = "clientId";
const LOCAL_DEV_URL = "http://127.0.0.1:8787/api";
// const LOCAL_DEV_URL = "<YOUR-LOCAL-IP>";

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type ExpandedResponse<T extends keyof typeof AllEndpoints> = Expand<(typeof AllEndpoints)[T]["response"]>;

type SignOutFunction = () => void;

type ApiOptions = {
  /** overrides the base api request url */
  urlOverride?: string;
  /** client attestation for secure requests */
  clientAttestationBase64?: string;
  /** number of retries for failed requests */
  retries?: number;
  /** requestId for the request */
  requestId?: string;
};

class ApiClient {
  private signOut: SignOutFunction | null = null;
  private clientIdPromise: Promise<string> | null = null;

  registerSignOut(signOut: SignOutFunction) {
    this.signOut = signOut;
  }

  async getClientId(): Promise<string> {
    if (this.clientIdPromise === null) {
      this.clientIdPromise = this.loadOrCreateClientId();
    }
    return this.clientIdPromise;
  }

  private async loadOrCreateClientId(): Promise<string> {
    try {
      const clientId = await AsyncStorage.getItem(CLIENT_ID_KEY);
      if (clientId) {
        return clientId;
      }
      const newClientId = uuid.v4() as string;
      await AsyncStorage.setItem(CLIENT_ID_KEY, newClientId);
      return newClientId;
    } catch (error) {
      console.error("Error handling clientId:", error);
      throw error;
    }
  }

  private async getAuthToken(): Promise<string> {
    const token = await SecureStore.getItemAsync("auth_token");
    if (!token) {
      this.signOut?.();
      throw new Error("Unauthenticated");
    }
    return token;
  }

  async get<T extends keyof typeof AllEndpoints>({
    endpointName,
    signal,
    params,
    options,
  }: {
    endpointName: T;
    signal: AbortSignal;
    params?: object;
    options?: ApiOptions;
  }): Promise<ExpandedResponse<T>> {
    return this.apiCall<T>({
      route: AllEndpoints[endpointName].path,
      method: "GET",
      params,
      options,
      signal,
      authenticate: "authenticate" in AllEndpoints[endpointName] ? AllEndpoints[endpointName].authenticate : false,
    });
  }

  async post<T extends keyof typeof AllEndpoints>({
    endpointName,
    signal,
    body,
    options,
  }: {
    endpointName: T;
    signal: AbortSignal;
    body?: InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>;
    options?: ApiOptions;
  }): Promise<ExpandedResponse<T>> {
    return this.apiCall<T>({
      route: AllEndpoints[endpointName].path,
      method: "POST",
      body,
      options,
      signal,
      authenticate: "authenticate" in AllEndpoints[endpointName] ? AllEndpoints[endpointName].authenticate : false,
    });
  }

  async apiCall<T extends keyof typeof AllEndpoints>({
    route,
    method,
    params,
    body,
    options = {},
    signal,
    authenticate,
  }: {
    route: (typeof AllEndpoints)[T]["path"];
    method: "GET" | "POST";
    authenticate: boolean;
    params?: object;
    body?: InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>;
    options?: ApiOptions;
    signal?: AbortSignal;
  }): Promise<ExpandedResponse<T>> {
    const { retries = 0, clientAttestationBase64, urlOverride, requestId } = options;
    const apiUrl = LOCAL_DEV_URL;

    try {
      const payload = JSON.stringify(body);
      console.log(
        `Invoking API: ${apiUrl}${route} ${method} ${payload.length > 100 ? payload.substring(0, 97) + "..." : payload}`
      );
      const token = authenticate ? await this.getAuthToken() : null;
      const clientId = await this.getClientId();
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-platform": Platform.OS === "web" ? "web" : "mobile",
        "x-client-id": clientId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(requestId ? { "x-request-id": requestId } : {}),
        ...(clientAttestationBase64 ? { "x-client-attestation": clientAttestationBase64 } : {}),
      };

      const response = await fetch(`${urlOverride || apiUrl}${route}`, {
        method,
        headers,
        body: JSON.stringify(body),
        signal,
        ...(Platform.OS === "web"
          ? {
              credentials: "include",
              mode: "cors",
            }
          : {}),
      });

      if (!response.ok) {
        const responseText = await response.text();
        const isRetryableError = [500, 502, 503, 504].includes(response.status);
        if (isRetryableError && retries > 0) {
          return this.apiCall<T>({
            route,
            method,
            params,
            body,
            authenticate,
            options: { ...options, retries: retries - 1 },
          });
        }
        if (response.status === 401) {
          this.signOut?.();
        }
        throw new Error(`Request failed with status ${response.status}: ${responseText}`);
      }
      console.log(`Call successful: ${route} ${method}`);

      return response.json() as unknown as ExpandedResponse<T>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
