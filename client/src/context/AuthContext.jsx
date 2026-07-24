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
  // COMPLETE LOGIN
  // ==========================
  const completeLogin = (accessToken, userData) => {
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
  };

  // ==========================
  // REGISTER
  // ==========================
  const register = async (userData) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/register", userData);

      if (response.data?.token) {
        localStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          response.data.token
        );
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
  // LOGIN (STEP 1)
  // ==========================
  const login = async (credentials) => {
    const response = await api.post(
      "/auth/login",
      credentials
    );

    return response.data;
  };

  // ==========================
  // VERIFY LOGIN (STEP 2)
  // ==========================
  const verifyLogin = async (email, code) => {
    setLoading(true);

    try {
      const response = await api.post(
        "/auth/verify-login",
        {
          email,
          code,
        }
      );

      const {
        accessToken,
        user: userData,
      } = response.data;

      completeLogin(accessToken, userData);

      return response.data;
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // LOGOUT
  // ==========================
  const logout = () => {
    localStorage.removeItem(
      STORAGE_KEYS.ACCESS_TOKEN
    );

    localStorage.removeItem(
      STORAGE_KEYS.REFRESH_TOKEN
    );

    localStorage.removeItem(
      STORAGE_KEYS.USER
    );

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
        completeLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;