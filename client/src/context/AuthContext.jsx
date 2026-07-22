import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import { STORAGE_KEYS } from "../utils/constants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;

  // ==========================
  // REGISTER
  // ==========================
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/auth/register", userData);

      if (response.data?.token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.token);
      }

      if (response.data?.user) {
        localStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(response.data.user)
        );
        setUser(response.data.user);
      }

      return response.data;
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // LOGIN (STEP 1: Triggers OTP Email)
  // ==========================
  const login = async (credentials) => {
    // Rely on component's local loading state for smooth UI transition
    const response = await api.post("/v1/auth/login", credentials);
    return response.data; // MUST return response payload
  };

  // ==========================
  // VERIFY LOGIN (STEP 2: OTP Verification)
  // ==========================
  const verifyLogin = async (email, code) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/auth/verify-login", {
        email,
        code,
      });

      const { accessToken, user: userData } = response.data;

      if (accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }

      if (userData) {
        localStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(userData)
        );
        setUser(userData);
      }

      return response.data;
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // LOGOUT
  // ==========================
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        register,
        login,
        verifyLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;