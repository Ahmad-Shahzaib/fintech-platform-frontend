"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from '@/lib/axios';
import {
  User,
  AuthState,
  LoginCredentials,
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
    // Listen to storage events (login state changes in other tabs or manual localStorage updates)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user') {
        checkAuth();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("auth_token");

      if (storedUser && token) {
        // Stored user may either be the new `User` shape or an older/mock shape.
        // Normalize to ensure it follows the `User` interface used in the app.
        const parsed = JSON.parse(storedUser);
        // If the backend provides role as role_id, map it to UserRole
        // Otherwise, if it already contains role string, keep it.
        const user: User = {
          id: String(parsed.id),
          email: parsed.email,
          name: parsed.name,
          role: ((): UserRole => {
            if (typeof parsed.role === 'string' && (parsed.role === 'admin' || parsed.role === 'user')) {
              return parsed.role as UserRole;
            }
            // If role_id is provided (1 -> admin, else -> user)
            if (typeof parsed.role_id === 'number') {
              return parsed.role_id === 1 ? UserRole.ADMIN : UserRole.USER;
            }
            // fallback
            return UserRole.USER;
          })(),
          avatar: parsed?.avatar ?? parsed?.user?.avatar,
        };
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
      // Call actual backend login endpoint
      const response = await api.post('/login', {
        email: credentials.email,
        password: credentials.password,
      });

      // Many backends return token and user under response.data.data
      const data = response.data?.data ?? response.data;
      const token = data?.token ?? data?.access_token ?? response.data?.token ?? null;
      const userPayload = data?.user ?? response.data?.user ?? null;

      if (!token || !userPayload) {
        return { success: false, error: response.data?.message || 'Invalid login response' };
      }

      // Map role_id to our UserRole enum if necessary
      const user: User = {
        id: String(userPayload.id),
        email: userPayload.email,
        name: userPayload.name,
        role: ((): UserRole => {
          // If API returns role as string
          if (typeof userPayload.role === 'string' && (userPayload.role === 'admin' || userPayload.role === 'user')) {
            return userPayload.role as UserRole;
          }
          // If API returns role_id as number: 1 => admin, 2 => user
          if (typeof userPayload.role_id === 'number') {
            return userPayload.role_id === 1 ? UserRole.ADMIN : UserRole.USER;
          }
          // fallback to user
          return UserRole.USER;
        })(),
        avatar: userPayload.avatar ?? userPayload.user?.avatar,
      };

      try {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        // ignore local storage errors
      }

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
      let e = error as any;
      const message = e?.response?.data?.message ?? e?.message ?? 'An error occurred during login';
      return {
        success: false,
        error: message,
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
