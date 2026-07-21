import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import { STORAGE_KEYS } from "../utils/constants";

// Yahan 'export' add kar dein:
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/auth/register", userData);

      if (response.data?.token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
        setUser(response.data.user);
      }

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed. Please try again.";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);