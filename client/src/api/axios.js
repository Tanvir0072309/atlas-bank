import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS, ROUTES } from "../utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL, // Ensure constants.js has: http://localhost:5000/api/v1
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
    const requestUrl = error.config?.url || "";

    // Dynamic check for all unauthenticated/public auth endpoints
    const isPublicAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/verify-login") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/verify-reset-code") ||
      requestUrl.includes("/auth/reset-password") ||
      requestUrl.includes("/auth/register");

    // Clear session & redirect ONLY if a PROTECTED route throws 401
    if (error.response?.status === 401 && !isPublicAuthEndpoint) {
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