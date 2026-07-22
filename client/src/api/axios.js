import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS, ROUTES } from "../utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Interceptor for Request (Attach bearer token automatically)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for Response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes("/v1/auth/login") || error.config?.url?.includes("/v1/auth/verify-login");

    // Clear session & redirect ONLY if the token failed on a protected route (NOT login endpoints)
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

export default api;