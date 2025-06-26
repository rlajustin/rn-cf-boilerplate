import axios, { AxiosRequestConfig } from "axios";
import { AllEndpoints } from "shared";

const LOCAL_DEV_URL = "http://127.0.0.1:8787/api";

async function apiCall<T extends keyof typeof AllEndpoints>(
  endpointName: T,
  options?: {
    params?: (typeof AllEndpoints)[T]["query"];
    body?: InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>;
    config?: AxiosRequestConfig;
    authenticate?: (typeof AllEndpoints)[T]["authenticate"];
    signal?: AbortSignal;
  }
): Promise<(typeof AllEndpoints)[T]["response"]> {
  const endpoint = AllEndpoints[endpointName];
  const url = `${LOCAL_DEV_URL}${endpoint.path}`;
  const { params, body, config, authenticate = false, signal } = options || {};
  try {
    if (endpoint.method === "get") {
      const res = await axios.get(url, {
        params,
        withCredentials: authenticate,
        signal,
        headers: {
          Accept: "application/json",
          ...(config?.headers || {}),
        },
        ...config,
      });
      return res.data;
    } else {
      const res = await axios.post(url, body, {
        withCredentials: authenticate,
        signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(config?.headers || {}),
        },
        ...config,
      });
      return res.data;
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMsg = err.response?.data || err.message || `${endpoint.method.toUpperCase()} ${endpoint.path} failed`;
      throw new Error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    }
    throw err;
  }
}

export const apiClient = {
  get<T extends keyof typeof AllEndpoints>(
    endpointName: T,
    signal: AbortSignal,
    params?: (typeof AllEndpoints)[T]["query"],
    config?: AxiosRequestConfig
  ) {
    return apiCall(endpointName, { params, config, signal });
  },
  post<T extends keyof typeof AllEndpoints>(
    endpointName: T,
    signal: AbortSignal,
    body?: InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>,
    config?: AxiosRequestConfig
  ) {
    return apiCall(endpointName, { body, config, signal });
  },
};
