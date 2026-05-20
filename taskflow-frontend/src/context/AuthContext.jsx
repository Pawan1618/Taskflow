import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, signupUser, logoutUser, getMe } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user has a valid HttpOnly cookie session
    const fetchUser = async () => {
      try {
        const { data } = await getMe();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        // Not authenticated or token expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await loginUser(credentials);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      const { data } = await signupUser(userData);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
