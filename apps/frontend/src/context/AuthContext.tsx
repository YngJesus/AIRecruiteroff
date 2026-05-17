import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "recruiter" | "tech_lead";
  departmentId?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (
    role:
      | "admin"
      | "recruiter"
      | "tech_lead"
      | ("admin" | "recruiter" | "tech_lead")[],
  ) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token exists on app load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      setToken(data.token);
      setCurrentUser(data.user);

      // Store in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const hasRole = (
    role:
      | "admin"
      | "recruiter"
      | "tech_lead"
      | ("admin" | "recruiter" | "tech_lead")[],
  ) => {
    if (!currentUser) return false;
    if (typeof role === "string") {
      return currentUser.role === role;
    }
    return role.includes(currentUser.role);
  };

  const value: AuthContextType = {
    currentUser,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
