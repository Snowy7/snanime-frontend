import { apiRequest, storeAccessToken, getStoredAccessToken } from "@/services/api-base";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  preferences?: any;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  getStoredAccessToken,
  storeAccessToken,

  async me(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/me", { method: "GET", auth: true });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.tokens?.accessToken) storeAccessToken(data.tokens.accessToken);
    return data;
  },

  async register(params: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(params),
    });
    if (data?.tokens?.accessToken) storeAccessToken(data.tokens.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<null>("/auth/logout", { method: "POST" });
    } finally {
      storeAccessToken(null);
    }
  },
};
