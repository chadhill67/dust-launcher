import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Config } from "../../config";

const baseURL = Config.BACKEND_URL;

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const http = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

http.interceptors.request.use(
  (config) => {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      console.error(`[API] Network error: ${error.message}`);
    } else if (error.response.status >= 500) {
      console.error(`[API] Server error: ${error.response.status}`);
    }
    return Promise.reject(error);
  }
);

export async function request<T>(
  config: AxiosRequestConfig & { timeout?: number; retries?: number },
): Promise<ApiResponse<T>> {
  const maxRetries = config.retries ?? 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await http.request<T>({
        ...config,
        timeout: config.timeout ?? 10000,
      });
      return { success: true, data: response.data };
    } catch (error) {
      attempt++;
      const err = error as AxiosError;
      const isRetryable = !err.response || (err.response?.status || 0) >= 500;
      
      if (!isRetryable || attempt >= maxRetries) {
        let errorMessage = "";
        if (!err.response) {
          errorMessage = "Unable to connect to backend. Please contact dust support and report backend connection status.";
        } else if (typeof err.response?.data === "string") {
          errorMessage = err.response.data;
        } else if (typeof err.response?.data === "object" && err.response?.data !== null) {
          const resData = err.response.data as Record<string, any>;
          errorMessage =
            resData.errorMessage ||
            resData.error_description ||
            resData.message ||
            resData.error ||
            "An error occurred";
        } else {
          errorMessage = err.message || "Unknown error";
        }
        return {
          success: false,
          error: errorMessage,
        };
      }
      
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return { success: false, error: "Max retries exceeded" };
}
