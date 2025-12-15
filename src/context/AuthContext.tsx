"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService, type AuthUser } from "@/services/auth";

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (params: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Only attempt if we have some auth (token or cookie)
      const token = authService.getStoredAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await authService.me();
      setUser(me);
    } catch (e) {
      authService.storeAccessToken(null);
      setUser(null);
      setError(e instanceof Error ? e.message : "Failed to load session");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
    } catch (e) {
      setUser(null);
      setError(e instanceof Error ? e.message : "Login failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (params: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await authService.register(params);
        setUser(result.user);
      } catch (e) {
        setUser(null);
        setError(e instanceof Error ? e.message : "Signup failed");
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Logout failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, isLoading, error, refresh, login, register, logout }),
    [user, isLoading, error, refresh, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}


