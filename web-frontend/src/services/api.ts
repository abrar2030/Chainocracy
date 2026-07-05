import axios, { type AxiosInstance } from "axios";
import { getItemAsync } from "@/context/SecureStore";
import { GLOBAL_VARIABLES, TOKEN_KEY } from "@/global/globalVariables";

// Use environment variable if available, fallback to GLOBAL_VARIABLES
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? `http://${GLOBAL_VARIABLES.LOCALHOST}`;
const API_URL = `${API_BASE_URL}/api`;
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10);

export const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // You can add global request logic here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // You can implement token refresh logic here
    }

    return Promise.reject(error);
  },
);

export const api_private = async (): Promise<AxiosInstance> => {
  const token = await getItemAsync(TOKEN_KEY);

  const instance = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // Add response interceptor for private API
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // Token refresh logic could be implemented here
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Export the base URL for direct use if needed
export const getApiBaseUrl = () => API_BASE_URL;
export const getApiUrl = () => API_URL;
