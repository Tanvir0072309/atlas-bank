import api from "../api/axios";
import { STORAGE_KEYS } from "../utils/constants";

// Safe Session Persistence
const persistSession = ({ accessToken, refreshToken, user }) => {
  if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

// Helper function to sanitize email inputs (Trim spaces & Lowercase)
const sanitizeEmail = (email) => (email ? String(email).trim().toLowerCase() : "");

export const authService = {
  // ==========================
  // REGISTER & EMAIL VERIFICATION
  // ==========================
  async register(payload) {
    const cleanPayload = {
      ...payload,
      email: sanitizeEmail(payload.email),
    };
    const { data } = await api.post("/auth/register", cleanPayload);
    return data; // expected: { message, email }
  },

  // ==========================================
  // Verify Email
  // ==========================================
  async verifyEmail(token) {
    const { data } = await api.get(
      `/auth/verify-email?token=${encodeURIComponent(token)}`
    );

    return data;
  },
  async resendOtp({ email }) {
    const { data } = await api.post("/auth/resend-otp", {
      email: sanitizeEmail(email),
    });
    return data;
  },

  // ==========================
  // 2-STEP LOGIN FLOW
  // ==========================
  // Step 1: Validate credentials & trigger OTP
  async login({ email, password }) {
    const { data } = await api.post("/auth/login", {
      email: sanitizeEmail(email),
      password,
    });
    // Note: Don't persist session here! Tokens will be issued after OTP verification in Step 2.
    return data;
  },

  // Step 2: Verify OTP & Persist session
  async verifyLogin({ email, code }) {
    const { data } = await api.post("/auth/verify-login", {
      email: sanitizeEmail(email),
      code,
    });
    persistSession(data); // Save accessToken, refreshToken & user object
    return data;
  },

  // ==========================
  // 3-STEP FORGOT / RESET PASSWORD FLOW
  // ==========================
  // Step 1: Request reset OTP
  async forgotPassword({ email }) {
    const { data } = await api.post("/auth/forgot-password", {
      email: sanitizeEmail(email),
    });
    return data;
  },

  // Step 2: Verify reset OTP & get resetToken
  async verifyResetCode({ email, code }) {
    const { data } = await api.post("/auth/verify-reset-code", {
      email: sanitizeEmail(email),
      code,
    });
    return data; // expected: { success, message, resetToken }
  },

  // Step 3: Reset password with resetToken
  async resetPassword({ resetToken, newPassword, confirmPassword }) {
    const { data } = await api.post("/auth/reset-password", {
      resetToken,
      newPassword,
      confirmPassword,
    });
    return data;
  },

  // ==========================
  // USER & SESSION MANAGEMENT
  // ==========================
  async getCurrentUser() {
    const { data } = await api.get("/auth/me");
    return data;
  },

  logout() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem("resetToken");
  },

  getStoredUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
  },
};

export default authService;