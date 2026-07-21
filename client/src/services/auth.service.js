import api from "../api/axios";
import { STORAGE_KEYS } from "../utils/constants";

const persistSession = ({ accessToken, refreshToken, user }) => {
  if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const authService = {
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data; // expected: { message, email } — user still needs to verify
  },

  async verifyEmail({ email, otp }) {
    const { data } = await api.post("/auth/verify-email", { email, otp });
    return data;
  },

  async resendOtp({ email }) {
    const { data } = await api.post("/auth/resend-otp", { email });
    return data;
  },

  async login({ email, password }) {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data);
    return data;
  },

  async forgotPassword({ email }) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  async resetPassword({ email, otp, password }) {
    const { data } = await api.post("/auth/reset-password", { email, otp, password });
    return data;
  },

  async getCurrentUser() {
    const { data } = await api.get("/auth/me");
    return data;
  },

  logout() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  getStoredUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
  },
};
