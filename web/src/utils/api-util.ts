import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { AllEndpoints, AuthScopeType, GetEndpointsKeys, PostEndpointsKeys } from "shared";

// needs to match specifically "localhost" or "127.0.0.1" to be the same as your frontend url for CSRF cookies purposes
const LOCAL_DEV_URL = "http://localhost:8787";

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type ExpandedResponse<T extends keyof typeof AllEndpoints> = Expand<(typeof AllEndpoints)[T]["response"]>;

type ApiCallParams<T extends keyof typeof AllEndpoints> = {
  endpointName: T;
  options: {
    params?: (typeof AllEndpoints)[T]["query"];
    body?: InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>;
    config?: AxiosRequestConfig;
    signal?: AbortSignal;
  };
  retries?: number;
};

type SignOutFunction = () => Promise<void>;

type QueueItem<T extends keyof typeof AllEndpoints> = {
  resolve: (value: ExpandedResponse<T>) => void;
  reject: (reason?: string) => void;
  params: ApiCallParams<T>;
};

class ApiClient {
  private signOut: SignOutFunction | null = null;
  private setAuthScope: ((scope: AuthScopeType) => void) | null = null;

  private refreshTokenPromise: Promise<{ scope: AuthScopeType; expires: number }> | null = null;
  private failedQueue: Array<QueueItem<keyof typeof AllEndpoints>> = [];
  private initialQueue: Array<QueueItem<keyof typeof AllEndpoints>> = [];

  private accessTokenExpires: number | null = null;

  private isInitializing = false;
  private initialized = false;

  async init(
    signOut: SignOutFunction,
    accessTokenExpires: number | null,
    setAuthScope: (scope: AuthScopeType) => void
  ) {
    this.signOut = signOut;
    this.setAuthScope = setAuthScope;
    this.isInitializing = true;
    try {
      if (!accessTokenExpires || accessTokenExpires < Date.now()) {
        try {
          const { scope, expires } = await this.refreshAccessToken();

          this.accessTokenExpires = expires;
          this.setAuthScope(scope);
        } catch {
          await this.signOut?.();
        }
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
  private async refreshAccessToken(): Promise<{ scope: AuthScopeType; expires: number }> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        // not handled with apiCall not defined in shared
        const refreshResponse = await axios.post<{
          success: boolean;
          data: {
            scope: AuthScopeType;
            expires: number;
          };
        }>(
          `${LOCAL_DEV_URL}/api/refresh`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );
        const { data } = refreshResponse.data;
        this.processFailedQueue(null);
        return data;
      } catch (refreshError) {
        if (isAxiosError(refreshError)) {
          this.processFailedQueue(refreshError.message);
        } else {
          this.processFailedQueue("Failed to refresh token, please log in again");
        }
        await this.signOut?.();
        throw refreshError;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();
    return this.refreshTokenPromise;
  }

  private async apiCall<T extends keyof typeof AllEndpoints>({
    endpointName,
    options,
    retries = 1,
  }: ApiCallParams<T>): Promise<(typeof AllEndpoints)[T]["response"]> {
    if (!this.initialized) {
      throw new Error("API Client not initialized");
    }
    if (this.isInitializing) {
      return new Promise<ExpandedResponse<T>>((resolve, reject) => {
        const queueItem: QueueItem<T> = {
          resolve,
          reject,
          params: { endpointName, options, retries },
        };
        this.initialQueue.push(queueItem);
      });
    }
    const endpoint = AllEndpoints[endpointName];
    const url = `${LOCAL_DEV_URL}/api${endpoint.path}`;
    const { params, body, config, signal } = options || {};
    const authenticate = AllEndpoints[endpointName].authScope !== null;
    const needsCredentials = authenticate || ["LOGIN", "REGISTER_ACCOUNT"].includes(endpointName);
    try {
      if (endpoint.method === "get") {
        const res = await axios.get(url, {
          params,
          withCredentials: needsCredentials,
          signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...config?.headers,
          },
          ...config,
        });
        return res.data;
      } else {
        const res = await axios.post(url, body, {
          withCredentials: needsCredentials,
          signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...config?.headers,
          },
          ...config,
        });
        return res.data;
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const status = err.response.status;
        const isRetryableError = [502, 503, 504].includes(status);
        if (isRetryableError && retries > 0) {
          return this.apiCall<T>({
            endpointName,
            options,
            retries: retries - 1,
          });
        }
        if (status === 401) {
          const originalParams = { endpointName, options, retries };

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
      throw (err as Error).message;
    }
  }

  async get<T extends GetEndpointsKeys>(
    endpointName: T,
    signal: AbortSignal,
    params?: (typeof AllEndpoints)[T]["query"],
    config?: AxiosRequestConfig
  ) {
    return this.apiCall({ endpointName, options: { params, config, signal } });
  }
  async post<T extends PostEndpointsKeys>(
    endpointName: T,
    signal: AbortSignal,
    body?: InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>,
    config?: AxiosRequestConfig
  ) {
    return this.apiCall({ endpointName, options: { body, config, signal } });
  }
}

export const apiClient = new ApiClient();
