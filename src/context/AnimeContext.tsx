"use client";
import Loading from "@/components/Loading";
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { AniListService } from "@/services/anilist";
import { SnAnimeService } from "@/services/snanime";

interface AnimeContextType {
  isLoading: boolean;
  getTopAnimes: () => Promise<SnAnimePaginatedResult<SnAnimeSpotlight>>;
  getAnimes: () => Promise<AnilistAnime[]>;
  getAnimeById: (id: string) => Promise<SnAnimeData | null>;
  getAnilistAnimeById: (id: string) => Promise<AnilistAnime | null>;
  searchAnimes: (
    query: string,
    page: number,
    perPage: number
  ) => Promise<SnAnimePaginatedResult<SnAnimeSearchResult>>;
  getAnimesByGenre: (genre: string) => Promise<AnilistAnime[]>;
  getLatestEpisodes: () => Promise<SnAnimePaginatedResult<SnAnimeRecentlyUpdated>>;
  getAnimeEpisodes: (
    id: string,
    page: number,
    perPage: number
  ) => Promise<PaginatedResult<SnAnimeEpisode>>;
  getAnimeEpisode(id: string, episodeNumber: string): Promise<SnEpisodeDetails | null>;
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
  const getTopAnimes = async (): Promise<SnAnimePaginatedResult<SnAnimeSpotlight>> => {
    incrementLoading();
    try {
      const response = await snanime.getSpotlight("en");
      return response;
    } catch (error) {
      console.error("Error fetching top animes:", error);
      return {
        currentPage: 1,
        hasNextPage: false,
        totalPages: 0,
        results: [],
      };
    } finally {
      decrementLoading();
    }
  };

  const getAnimes = async (): Promise<AnilistAnime[]> => {
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

  const getAnimeById = async (id: string): Promise<SnAnimeData | null> => {
    incrementLoading();
    try {
      if (!id) {
        console.warn("getAnimeById called with empty id");
        return null;
      }

      // run both in parallel
      //const [arabicAnime, defaultAnime] = await Promise.all([snanime.getAnimeByMalId(numericId), anilist.getAnimeByMalId(numericId)]);
      const arabicAnime = await snanime.getAnimeInfo(id); // Placeholder for Arabic anime, replace with actual call if needed
      // const defaultAnime = await anilist.getAnimeByMalId(arabicAnime?.malID)

      if (arabicAnime) {
        arabicAnime.banner = arabicAnime.image;
        return arabicAnime;
      }

      console.warn("No anime found with id:", id);
      return null; // If no anime found, return null
    } catch (error) {
      console.error("Error fetching anime by ID:", error);
      return null;
    } finally {
      decrementLoading();
    }
  };

  const getAnilistAnimeById = async (id: string): Promise<AnilistAnime | null> => {
    incrementLoading();
    try {
      if (!id) {
        console.warn("getAnilistAnimeById called with empty id");
        return null;
      }

      // convert id to number if it's a string
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      if (isNaN(numericId)) {
        console.warn("getAnilistAnimeById called with invalid id:", id);
        return null;
      }

      const response = await anilist.getAnimeByMalId(numericId);
      return response;
    } catch (error) {
      console.error("Error fetching Anilist anime by ID:", error);
      return null;
    } finally {
      decrementLoading();
    }
  };

  const searchAnimes = async (
    query: string,
    page: number,
    perPage: number
  ): Promise<SnAnimePaginatedResult<SnAnimeSearchResult>> => {
    try {
      const response = await snanime.searchAnime(query, "en");
      return response;
    } catch (error) {
      console.error("Error searching animes:", error);
      return {
        currentPage: 1,
        hasNextPage: false,
        totalPages: 0,
        results: [],
      };
    } finally {
    }
  };

  const getAnimesByGenre = async (genre: string): Promise<AnilistAnime[]> => {
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

  const getLatestEpisodes = async (): Promise<SnAnimePaginatedResult<SnAnimeRecentlyUpdated>> => {
    incrementLoading();
    try {
      const response = await snanime.getLatestEpisodes("en");
      return response;
    } catch (error) {
      console.error("Error fetching latest episodes:", error);
      return {
        currentPage: 1,
        hasNextPage: false,
        totalPages: 0,
        results: [],
      };
    } finally {
      decrementLoading();
    }
  };
  const getAnimeEpisodes = async (
    id: string,
    page: number,
    perPage: number
  ): Promise<PaginatedResult<SnAnimeEpisode>> => {
    incrementLoading();
    try {
      const response = {} as PaginatedResult<SnAnimeEpisode>; // await snanime.getAnimeEpisodes(id, page, perPage);
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

  const getAnimeEpisode = async (
    id: string,
    episodeNumber: string
  ): Promise<SnEpisodeDetails | null> => {
    incrementLoading();
    try {
      if (!id || !episodeNumber) {
        console.warn("getAnimeEpisode called with empty id or episodeNumber");
        return null;
      }

      // convert episodeNumber to number if it's a string
      const numericEpisodeNumber =
        typeof episodeNumber === "string" ? parseInt(episodeNumber, 10) : episodeNumber;
      if (isNaN(numericEpisodeNumber)) {
        console.warn("getAnimeEpisode called with invalid episodeNumber:", episodeNumber);
        return null;
      }

      const response = await snanime.getAnimeEpisode(id, numericEpisodeNumber, "en");
      if (!response || !response.streams || response.streams.sources.length === 0) {
        console.warn("No streams found for episode:", id, "Episode Number:", episodeNumber);
        return null;
      }
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
    getAnilistAnimeById,
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
