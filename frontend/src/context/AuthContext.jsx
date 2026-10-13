import { createContext, useContext, useState } from "react";
import { apiRequest } from "../api/api";

// A Context is a "shared box" any component can open, so we do not have to
// pass the logged-in user through props from page to page.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start from what is saved in the browser, so a refresh keeps you logged in.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const data = await apiRequest("/api/auth/login", "POST", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
