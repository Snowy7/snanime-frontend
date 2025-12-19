/**
 * User Service
 * 
 * Handles user-related API calls (watchlist, favorites, history)
 * Requires authentication via StackAuth
 */

import { API_BASE_URL } from "./api-base";

export type WatchStatus = "WATCHING" | "COMPLETED" | "ON_HOLD" | "DROPPED" | "PLAN_TO_WATCH";

export interface WatchlistItem {
  id: string;
  malId: number;
  status: WatchStatus;
  progress: number;
  score: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteItem {
  id: string;
  malId: number;
  createdAt: string;
}

export interface WatchHistoryItem {
  id: string;
  malId: number;
  episodeNumber: number;
  watchedAt: string;
  progress: number;
  duration: number | null;
  completed: boolean;
}

export interface UserStats {
  watchlistCount: number;
  favoritesCount: number;
  watchedEpisodes: number; // Total episodes with any progress
  completedEpisodes: number; // Episodes watched to completion (90%+)
  completedAnime: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  profileImageUrl: string | null;
  stats: UserStats;
}

/**
 * Make authenticated request to user API
 */
async function userApiRequest<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const userService = {
  // ==========================================
  // Profile
  // ==========================================

  async getProfile(accessToken: string): Promise<UserProfile> {
    return userApiRequest<UserProfile>("/user/me", accessToken);
  },

  async getStats(accessToken: string): Promise<UserStats> {
    return userApiRequest<UserStats>("/user/stats", accessToken);
  },

  // ==========================================
  // Watchlist
  // ==========================================

  async getWatchlist(accessToken: string, status?: WatchStatus): Promise<WatchlistItem[]> {
    const params = status ? `?status=${status}` : "";
    const result = await userApiRequest<{ watchlist: WatchlistItem[] }>(
      `/user/watchlist${params}`,
      accessToken
    );
    return result.watchlist;
  },

  async getWatchlistItem(accessToken: string, malId: number): Promise<WatchlistItem | null> {
    const result = await userApiRequest<{ item: WatchlistItem | null }>(
      `/user/watchlist/${malId}`,
      accessToken
    );
    return result.item;
  },

  async addToWatchlist(
    accessToken: string,
    malId: number,
    data?: {
      status?: WatchStatus;
      progress?: number;
      score?: number;
      notes?: string;
    }
  ): Promise<WatchlistItem> {
    const result = await userApiRequest<{ item: WatchlistItem }>(
      `/user/watchlist/${malId}`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify(data || {}),
      }
    );
    return result.item;
  },

  async updateWatchlistItem(
    accessToken: string,
    malId: number,
    data: {
      status?: WatchStatus;
      progress?: number;
      score?: number;
      notes?: string;
    }
  ): Promise<WatchlistItem> {
    const result = await userApiRequest<{ item: WatchlistItem }>(
      `/user/watchlist/${malId}`,
      accessToken,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
    return result.item;
  },

  async removeFromWatchlist(accessToken: string, malId: number): Promise<boolean> {
    const result = await userApiRequest<{ success: boolean }>(
      `/user/watchlist/${malId}`,
      accessToken,
      { method: "DELETE" }
    );
    return result.success;
  },

  // ==========================================
  // Favorites
  // ==========================================

  async getFavorites(accessToken: string): Promise<FavoriteItem[]> {
    const result = await userApiRequest<{ favorites: FavoriteItem[] }>(
      "/user/favorites",
      accessToken
    );
    return result.favorites;
  },

  async isFavorite(accessToken: string, malId: number): Promise<boolean> {
    const result = await userApiRequest<{ isFavorite: boolean }>(
      `/user/favorites/${malId}`,
      accessToken
    );
    return result.isFavorite;
  },

  async addToFavorites(accessToken: string, malId: number): Promise<FavoriteItem> {
    const result = await userApiRequest<{ item: FavoriteItem }>(
      `/user/favorites/${malId}`,
      accessToken,
      { method: "POST" }
    );
    return result.item;
  },

  async removeFromFavorites(accessToken: string, malId: number): Promise<boolean> {
    const result = await userApiRequest<{ success: boolean }>(
      `/user/favorites/${malId}`,
      accessToken,
      { method: "DELETE" }
    );
    return result.success;
  },

  // ==========================================
  // Watch History
  // ==========================================

  async getWatchHistory(
    accessToken: string,
    options?: { limit?: number; offset?: number }
  ): Promise<WatchHistoryItem[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.offset) params.set("offset", options.offset.toString());
    
    const result = await userApiRequest<{ history: WatchHistoryItem[] }>(
      `/user/history?${params}`,
      accessToken
    );
    return result.history;
  },

  async getContinueWatching(
    accessToken: string,
    limit?: number
  ): Promise<WatchHistoryItem[]> {
    const params = limit ? `?limit=${limit}` : "";
    const result = await userApiRequest<{ items: WatchHistoryItem[] }>(
      `/user/continue-watching${params}`,
      accessToken
    );
    return result.items;
  },

  async recordWatchProgress(
    accessToken: string,
    malId: number,
    episodeNumber: number,
    data: {
      progress: number;
      duration?: number;
      completed?: boolean;
    }
  ): Promise<WatchHistoryItem> {
    const result = await userApiRequest<{ item: WatchHistoryItem }>(
      `/user/history/${malId}/${episodeNumber}`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return result.item;
  },

  async getEpisodeProgress(
    accessToken: string,
    malId: number,
    episodeNumber: number
  ): Promise<WatchHistoryItem | null> {
    const result = await userApiRequest<{ progress: WatchHistoryItem | null }>(
      `/user/history/${malId}/${episodeNumber}`,
      accessToken
    );
    return result.progress;
  },

  async clearWatchHistory(accessToken: string): Promise<boolean> {
    const result = await userApiRequest<{ success: boolean }>(
      "/user/history",
      accessToken,
      { method: "DELETE" }
    );
    return result.success;
  },
};
