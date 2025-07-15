import "react-native-get-random-values";
import * as SecureStore from "expo-secure-store";
import uuid from "react-native-uuid";
import { AccessTokenBody, AllEndpoints, GetEndpointsKeys, PostEndpointsKeys } from "shared";
import AxiosConstructor, { AxiosRequestConfig, isAxiosError } from "axios";
import type { Exact } from "shared/src/types";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, CLIENT_ID_KEY, SignOutFunction } from "contexts/AuthContext";

// Create a custom instance with a default timeout (e.g., 10 seconds)
export const axios = AxiosConstructor.create({
  timeout: 5000, // 10 seconds
});

const LOCAL_DEV_URL = "http://localhost:8787";

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type ExpandedResponse<T extends keyof typeof AllEndpoints> = Expand<(typeof AllEndpoints)[T]["response"]>;

type ApiCallParams<T extends keyof typeof AllEndpoints> = {
  endpointName: T;
  options: {
    params?: Exact<(typeof AllEndpoints)[T]["query"]>;
    body?: InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>;
    config?: AxiosRequestConfig;
    signal?: AbortSignal;
  };
  retries?: number;
  // these only used for device attestation
  clientAttestationBase64?: string;
  requestId?: string;
};

type QueueItem<T extends keyof typeof AllEndpoints> = {
  resolve: (value: ExpandedResponse<T>) => void;
  reject: (reason?: string) => void;
  params: ApiCallParams<T>;
};

class ApiClient {
  private signOut: SignOutFunction | null = null;
  private clientIdPromise: Promise<string> | null = null;

  private refreshTokenPromise: Promise<string> | null = null;
  private failedQueue: Array<QueueItem<keyof typeof AllEndpoints>> = [];
  private initialQueue: Array<QueueItem<keyof typeof AllEndpoints>> = [];

  private isInitializing = false;
  private initialized = false;

  // Call this from AuthContext on app start
  async init(signOut: SignOutFunction) {
    this.signOut = signOut;
    this.isInitializing = true;
    try {
      const [refreshToken, accessToken] = await Promise.all([
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      ]);
      // Check if stored access cookie is valid are valid
      if (refreshToken) {
        const { exp } = accessToken ? (JSON.parse(atob(accessToken.split(".")[1])) as AccessTokenBody) : { exp: 0 };
        if (!accessToken || (exp && exp < Date.now())) {
          await this.refreshAccessToken();
        }
      } else {
        await this.signOut?.({ force: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isInitializing = false;
      this.initialized = true;
      // Process all queued requests
      this.initialQueue.forEach(({ resolve, reject, params }) => {
        this.apiCall(params)
          .then(resolve)
          .catch((error) => {
            reject(error.message);
          });
      });
      this.initialQueue = [];
    }
  }

  // Attempts to retry all failed requests if no error given
  private processFailedQueue(error: string | null) {
    this.failedQueue.forEach(({ resolve, reject, params }) => {
      if (error) {
        reject(error);
      } else {
        this.apiCall(params)
          .then(resolve)
          .catch((err) => {
            if (isAxiosError(err)) {
              console.error(err);
            }
          });
      }
    });
    this.failedQueue = [];
  }

  // Centralized refresh logic
  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }
    this.refreshTokenPromise = (async () => {
      try {
        console.log("Refreshing token");
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) {
          throw new Error("Unauthenticated");
        }
        const refreshResponse = await axios.post<{
          success: boolean;
          data: {
            accessToken: string;
          };
        }>(
          `${LOCAL_DEV_URL}/api/refresh`,
          {},
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "x-platform": "mobile",
              Cookie: `refresh_token=${refreshToken}`,
            },
          }
        );
        const { data } = refreshResponse.data;
        console.log(data);
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
        this.processFailedQueue(null);
        return data.accessToken;
      } catch (refreshError) {
        if (isAxiosError(refreshError)) {
          console.error(refreshError.response);
          this.processFailedQueue(refreshError.message);
        } else {
          this.processFailedQueue("Failed to refresh token, please log in again");
        }
        await this.signOut?.({ force: true });
        throw refreshError;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();
    return this.refreshTokenPromise;
  }

  // Used to call API and handle errors
  private async apiCall<T extends keyof typeof AllEndpoints>({
    endpointName,
    options,
    clientAttestationBase64,
    requestId,
    retries = 1,
  }: ApiCallParams<T>): Promise<ExpandedResponse<T>> {
    if (!this.initialized) {
      throw new Error("API Client not initialized");
    }
    // If initializing, queue the request
    if (this.isInitializing) {
      return new Promise<ExpandedResponse<T>>((resolve, reject) => {
        const queueItem: QueueItem<T> = {
          resolve,
          reject,
          params: { endpointName, options, clientAttestationBase64, requestId, retries },
        };
        this.initialQueue.push(queueItem);
      });
    }
    const endpoint = AllEndpoints[endpointName];
    const url = `${LOCAL_DEV_URL}/api${endpoint.path}`;
    const { params, body, config, signal } = options || {};
    const authenticate = AllEndpoints[endpointName].authScope !== null;

    try {
      const payload = JSON.stringify(options.body);
      console.log(
        `Invoking API: ${url} ${endpoint.method} ${payload.length > 100 ? payload.substring(0, 97) + "..." : payload}`
      );
      const [accessToken, refreshToken] = await Promise.all([this.getAccessToken(), this.getRefreshToken()]);

      if (endpointName === "LOGOUT" && !refreshToken) {
        this.signOut?.({ force: true });
        throw new Error("Logged out");
      }
      const cookieHeader = [
        accessToken && authenticate ? `access_token=${accessToken}` : null,
        endpointName === "LOGOUT" ? `refresh_token=${refreshToken}` : null,
      ]
        .filter(Boolean)
        .join("; ");

      const clientId = await this.getClientId();
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-platform": "mobile",
        "x-client-id": clientId,
        ...(cookieHeader.length ? { Cookie: cookieHeader } : {}),
        ...(requestId ? { "x-request-id": requestId } : {}),
        ...(clientAttestationBase64 ? { "x-client-attestation": clientAttestationBase64 } : {}),
        ...config?.headers,
      };
      console.log(JSON.stringify(headers));

      let response;
      if (endpoint.method === "post") {
        response = await axios.post<ExpandedResponse<T>>(url, body, { headers, signal, ...config });
      } else {
        response = await axios.get<ExpandedResponse<T>>(url, { params, headers, signal, ...config });
      }
      console.log(`Call successful: ${endpoint.method} ${endpoint.path}`);
      return response.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        console.log(`Call unsuccessful: ${err.response.status} ${endpoint.method} ${endpoint.path}`);
        const status = err.response.status;
        const isRetryableError = [500, 502, 503, 504].includes(status);
        if (isRetryableError && retries > 0) {
          return this.apiCall<T>({
            endpointName,
            options,
            clientAttestationBase64,
            requestId,
            retries: retries - 1,
          });
        }
        if (status === 401) {
          const originalParams = { endpointName, options, clientAttestationBase64, requestId, retries };

          // If already refreshing token, wait for that
          if (this.refreshTokenPromise) {
            return new Promise((resolve, reject) => {
              const queueItem: QueueItem<T> = { resolve, reject, params: originalParams };
              this.failedQueue.push(queueItem);
            });
          }
          // Otherwise, request refresh token and retry request
          await this.refreshAccessToken();
          return this.apiCall<T>(originalParams);
        }
        throw new Error(`Request failed with status ${status}: ${err.message}`);
      }
      console.error(err);
      throw (err as Error).message;
    }
  }

  async getClientId(): Promise<string> {
    if (this.clientIdPromise === null) {
      this.clientIdPromise = this.loadOrCreateClientId();
    }
    return this.clientIdPromise;
  }

  private async loadOrCreateClientId(): Promise<string> {
    try {
      const clientId = await SecureStore.getItemAsync(CLIENT_ID_KEY);
      if (clientId) {
        return clientId;
      }
      const newClientId = uuid.v4() as string;
      await SecureStore.setItemAsync(CLIENT_ID_KEY, newClientId);
      return newClientId;
    } catch (error) {
      console.error("Error handling clientId:", error);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  private async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  async get<T extends GetEndpointsKeys>({
    endpointName,
    signal,
    params,
    requestOptions,
  }: {
    endpointName: T;
    signal: AbortSignal;
    params: Exact<(typeof AllEndpoints)[T]["query"]>;
    requestOptions?: {
      clientAttestationBase64?: string;
      requestId?: string;
      retries?: number;
    };
  }): Promise<ExpandedResponse<T>> {
    return this.apiCall<T>({
      endpointName,
      options: {
        signal,
        params,
      },
      ...requestOptions,
    });
  }

  async post<T extends PostEndpointsKeys>({
    endpointName,
    signal,
    body,
    requestOptions,
  }: {
    endpointName: T;
    signal: AbortSignal;
    body?: InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>;
    requestOptions?: {
      clientAttestationBase64?: string;
      requestId?: string;
      retries?: number;
    };
  }): Promise<ExpandedResponse<T>> {
    return this.apiCall<T>({
      endpointName,
      options: {
        signal,
        body,
      },
      ...requestOptions,
    });
  }
}

export const apiClient = new ApiClient();
