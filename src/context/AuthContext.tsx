"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { appwriteAuth, Models } from "@/lib/appwrite";

// User type from Appwrite
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  profileImageUrl: string | null;
  emailVerified: boolean;
}

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => void;
  signUp: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
  // Access token for API calls
  getAccessToken: () => Promise<string | null>;
  // Refresh user data
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

function mapAppwriteUser(appwriteUser: Models.User<Models.Preferences>): AuthUser {
  return {
    id: appwriteUser.$id,
    email: appwriteUser.email,
    displayName: appwriteUser.name || null,
    profileImageUrl: appwriteUser.prefs?.avatar || null,
    emailVerified: appwriteUser.emailVerification,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const appwriteUser = await appwriteAuth.getUser();
      if (appwriteUser) {
        setUser(mapAppwriteUser(appwriteUser));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      console.log('[AuthContext] Refreshing user...');
      const appwriteUser = await appwriteAuth.getUser();
      if (appwriteUser) {
        setUser(mapAppwriteUser(appwriteUser));
      }
    } catch {
      setUser(null);
    }
  }, []);

  const signIn = useCallback(() => {
    window.location.href = "/login";
  }, []);

  const signUp = useCallback(() => {
    window.location.href = "/signup";
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await appwriteAuth.signInWithEmail(email, password);
    await refreshUser();
  }, [refreshUser]);

  const signUpWithEmail = useCallback(async (email: string, password: string, name?: string) => {
    await appwriteAuth.createAccount(email, password, name);
    await appwriteAuth.signInWithEmail(email, password);
    await refreshUser();
  }, [refreshUser]);

  const signInWithGoogle = useCallback(() => {
    appwriteAuth.signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await appwriteAuth.signOut();
    setUser(null);
    window.location.href = "/";
  }, []);

  const getAccessToken = useCallback(async () => {
    return appwriteAuth.getJWT();
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    getAccessToken,
    refreshUser,
  }), [user, isLoading, signIn, signUp, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, getAccessToken, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
