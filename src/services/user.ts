import { apiRequest } from "./api-base";
import { IAnime } from "@/types/anime";

export interface SavedAnime {
  animeId: string;
  title: string;
  posterUrl?: string;
  type?: string;
  year?: number;
  format?: string;
  status?: string;
  savedAt: string;
}

export const userService = {
  async getSaves(): Promise<SavedAnime[]> {
    return apiRequest<SavedAnime[]>("/auth/me/saves", { method: "GET", auth: true });
  },

  async addSave(anime: IAnime): Promise<SavedAnime[]> {
    return apiRequest<SavedAnime[]>("/auth/me/saves", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        animeId: anime.id,
        title: anime.title,
        posterUrl: anime.posterUrl,
        type: anime.type,
        year: typeof anime.year === 'string' ? parseInt(anime.year) : anime.year,
        format: anime.type, // Map type to format if needed
        status: anime.status,
      }),
    });
  },

  async removeSave(animeId: string): Promise<SavedAnime[]> {
    return apiRequest<SavedAnime[]>(`/auth/me/saves/${animeId}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

