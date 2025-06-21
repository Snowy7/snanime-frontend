"use client";
import Loading from "@/components/Loading";
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { AniListService } from "@/services/anilist";
import { SnAnimeService } from "@/services/snanime";

interface AnimeContextType {
  isLoading: boolean;
  getTopAnimes: () => Promise<Anime[]>;
  getAnimes: () => Promise<Anime[]>;
  getAnimeById: (id: string) => Promise<Anime | null>;
  searchAnimes: (query: string, page: number, perPage: number) => Promise<PaginatedResult<SearchResult>>;
  getAnimesByGenre: (genre: string) => Promise<Anime[]>;
  getLatestEpisodes: () => Promise<LatestEpisode[]>;
  getAnimeEpisodes: (id: string, page: number, perPage: number) => Promise<PaginatedResult<AnimeEpisode>>;
  getAnimeEpisode(id: string, episodeNumber: string): Promise<EpisodeDetails | null>;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

interface AnimeProviderProps {
  children: ReactNode;
}

const anilist = AniListService.getInstance();
const snanime = SnAnimeService.getInstance();

export const AnimeProvider: React.FC<AnimeProviderProps> = ({ children }) => {
  const [loading, setLoading] = React.useState<number>(1);

  useEffect(() => {
    // REMOVE INITIAL LOADING AFTER 1 SECOND
    const timer = setTimeout(() => {
      setLoading(0);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to increment loading counter
  const incrementLoading = () => {
    setLoading((prev) => prev + 1);
  };

  // Helper function to decrement loading counter
  const decrementLoading = () => {
    setLoading((prev) => Math.max(0, prev - 1));
  };

  // Define the methods that will be provided by the context
  const getTopAnimes = async (): Promise<Anime[]> => {
    incrementLoading();
    try {
      const response = await snanime.getTopAnimes("ar");
      return response;
    } catch (error) {
      console.error("Error fetching top animes:", error);
      return [];
    } finally {
      decrementLoading();
    }
  };
  const getAnimes = async (): Promise<Anime[]> => {
    incrementLoading();
    try {
      // Placeholder for fetching all animes
      return [];
    } catch (error) {
      console.error("Error fetching animes:", error);
      return [];
    } finally {
      decrementLoading();
    }
  };

  const getAnimeById = async (id: string): Promise<Anime | null> => {
    incrementLoading();
    try {
      if (!id) {
        console.warn("getAnimeById called with empty id");
        return null;
      }
      // convert id to number if it's a string
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      if (isNaN(numericId)) {
        console.warn("getAnimeById called with invalid id:", id);
        return null;
      }

      // run both in parallel
      const [arabicAnime, defaultAnime] = await Promise.all([snanime.getAnimeByMalId(numericId), anilist.getAnimeByMalId(numericId)]);

      if (arabicAnime) {
        arabicAnime.bannerUrl = defaultAnime?.bannerUrl || arabicAnime.bannerUrl;
        arabicAnime.posterUrl = defaultAnime?.posterUrl || arabicAnime.posterUrl;
        arabicAnime.characters = defaultAnime?.characters || arabicAnime.characters;
        arabicAnime.staff = defaultAnime?.staff || arabicAnime.staff;
        return arabicAnime;
      }

      console.warn("No anime found with id:", numericId);
      if (defaultAnime) {
        // If no Arabic anime found, return the default anime
        return {
          ...defaultAnime,
          id: numericId.toString(), // Ensure id is a string
          sub: "ENG",
        };
      }

      console.warn("No default anime found with id:", numericId);
      return null; // If no anime found, return null
    } catch (error) {
      console.error("Error fetching anime by ID:", error);
      return null;
    } finally {
      decrementLoading();
    }
  };

  const searchAnimes = async (query: string, page: number, perPage: number): Promise<PaginatedResult<SearchResult>> => {
    try {
      const response = await snanime.searchAnime(query, page, perPage);
      return response;
    } catch (error) {
      console.error("Error searching animes:", error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    } finally {
    }
  };

  const getAnimesByGenre = async (genre: string): Promise<Anime[]> => {
    incrementLoading();
    try {
      // Placeholder for fetching animes by genre
      return [];
    } catch (error) {
      console.error("Error fetching animes by genre:", error);
      return [];
    } finally {
      decrementLoading();
    }
  };

  const getLatestEpisodes = async (): Promise<LatestEpisode[]> => {
    incrementLoading();
    try {
      const response = await snanime.getLatestEpisodes("ar");
      return response;
    } catch (error) {
      console.error("Error fetching latest episodes:", error);
      return [];
    } finally {
      decrementLoading();
    }
  };
  const getAnimeEpisodes = async (id: string, page: number, perPage: number): Promise<PaginatedResult<AnimeEpisode>> => {
    incrementLoading();
    try {
      const response = await snanime.getAnimeEpisodes(id, page, perPage);
      return response;
    } catch (error) {
      console.error("Error fetching anime episodes:", error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    } finally {
      decrementLoading();
    }
  };

  const getAnimeEpisode = async (id: string, episodeNumber: string): Promise<EpisodeDetails | null> => {
    incrementLoading();
    try {
      if (!id || !episodeNumber) {
        console.warn("getAnimeEpisode called with empty id or episodeNumber");
        return null;
      }
      // convert id to number if it's a string
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      if (isNaN(numericId)) {
        console.warn("getAnimeEpisode called with invalid id:", id);
        return null;
      }
      // convert episodeNumber to number if it's a string
      const numericEpisodeNumber = typeof episodeNumber === "string" ? parseInt(episodeNumber, 10) : episodeNumber;
      if (isNaN(numericEpisodeNumber)) {
        console.warn("getAnimeEpisode called with invalid episodeNumber:", episodeNumber);
        return null;
      }
      const response = await snanime.getAnimeEpisode(numericId.toString(), numericEpisodeNumber);
      return response;
    } catch (error) {
      console.error("Error fetching anime episode:", error);
      return null;
    } finally {
      decrementLoading();
    }
  };

  const value: AnimeContextType = {
    isLoading: loading > 0,
    getTopAnimes,
    getAnimes,
    getAnimeById,
    searchAnimes,
    getAnimesByGenre,
    getLatestEpisodes,
    getAnimeEpisodes,
    getAnimeEpisode,
  };
  return (
    <AnimeContext.Provider value={value}>
      {loading > 0 && <Loading size="large" />}
      {children}
    </AnimeContext.Provider>
  );
};

export const useAnime = (): AnimeContextType => {
  const context = useContext(AnimeContext);
  if (context === undefined) {
    throw new Error("useAnime must be used within an AnimeProvider");
  }
  return context;
};
