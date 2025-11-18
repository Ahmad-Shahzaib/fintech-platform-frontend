"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  AuthState,
  LoginCredentials,
  MOCK_USERS,
  UserRole,
} from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("auth_token");

      if (storedUser && token) {
        const user: User = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userRecord = MOCK_USERS[credentials.email];

      if (!userRecord || userRecord.password !== credentials.password) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      const { user } = userRecord;

      // Generate mock token (in production, this comes from backend)
      const token = btoa(`${user.email}:${Date.now()}`);

      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("auth_token", token);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirect based on role
      if (user.role === UserRole.ADMIN) {
        router.push("/");
      } else {
        router.push("/dashboard");
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "An error occurred during login",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/signin");
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
