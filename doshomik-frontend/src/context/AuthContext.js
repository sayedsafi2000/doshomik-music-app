"use client";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // stores user object
  const [token, setToken] = useState(null); // stores token
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check from localStorage
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const login = (token, user) => {
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, setUser, setToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};