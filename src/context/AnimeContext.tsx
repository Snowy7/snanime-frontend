"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useTopAnimes } from "@/hooks/anime/useTopAnimes";
import { useAnimeDetails } from "@/hooks/anime/useAnimeDetails";
import { useAnimeEpisodes } from "@/hooks/anime/useAnimeEpisodes";
import { IPaginatedResult, IAnimeSpotlight, IAnime, IAnimeLatest, IAnimeEpisodeDetails } from "@/types/anime";

interface AnimeContextType {
  // Top animes
  getTopAnimes: () => Promise<IAnimeSpotlight[] | null>;
  fetchSpotlightAnime: () => Promise<IAnimeSpotlight[] | null>;
  
  // Anime details
  getAnimeById: (id: string) => Promise<IAnime | null>;
  fetchAnimeDetails: (id: string) => Promise<IAnime | null>;
  fetchAnilistDetails: (malId: number) => Promise<IAnime | null>;
  
  // Episodes
  getLatestEpisodes: (params?: any) => Promise<IPaginatedResult<IAnimeLatest> | null>;
  fetchLatestEpisodes: (params?: any) => Promise<IPaginatedResult<IAnimeLatest> | null>;
  getAnimeEpisode: (id: string, episodeNumber: string) => Promise<IAnimeEpisodeDetails | null>;
  fetchEpisodeDetails: (id: string, episodeNumber: string) => Promise<IAnimeEpisodeDetails | null>;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

export const AnimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { fetchSpotlightAnime } = useTopAnimes();
  const { fetchAnimeDetails, fetchAnilistDetails } = useAnimeDetails();
  const { fetchLatestEpisodes, fetchEpisodeDetails } = useAnimeEpisodes();

  const value: AnimeContextType = {
    // Top animes - new and legacy methods
    getTopAnimes: fetchSpotlightAnime,
    fetchSpotlightAnime,
    
    // Anime details - new and legacy methods
    getAnimeById: fetchAnimeDetails,
    fetchAnimeDetails,
    fetchAnilistDetails,
    
    // Episodes - new and legacy methods
    getLatestEpisodes: fetchLatestEpisodes,
    fetchLatestEpisodes,
    getAnimeEpisode: fetchEpisodeDetails,
    fetchEpisodeDetails,
  };

  return <AnimeContext.Provider value={value}>{children}</AnimeContext.Provider>;
};

export const useAnime = (): AnimeContextType => {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("useAnime must be used within an AnimeProvider");
  }
  return context;
};
