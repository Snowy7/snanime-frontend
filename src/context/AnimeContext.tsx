"use client";
import Loading from "@/components/Loading";
import React, { createContext, useContext, ReactNode } from "react";
import { useLoading } from "@/hooks/useLoading";
import {
  useTopAnimes,
  useAnimeSearch,
  useAnimeDetails,
  useAnimeEpisodes
} from "@/hooks/anime";
import { IAnime, IAnimeEpisode, IAnimeEpisodeDetails, IAnimeSearchResult, IPaginatedResult, IAnimeSearchParams } from "@/types/anime";

interface AnimeContextType {
  isLoading: boolean;
  getTopAnimes: () => Promise<IPaginatedResult<IAnimeSearchResult>>;
  getAnimeById: (id: string) => Promise<IAnime | null>;
  getAnilistAnimeById: (id: string) => Promise<IAnime | null>;
  searchAnimes: (params: IAnimeSearchParams) => Promise<IPaginatedResult<IAnimeSearchResult>>;
  getLatestEpisodes: () => Promise<IPaginatedResult<IAnimeSearchResult>>;
  getAnimeEpisodes: (
    id: string,
    page: number,
    perPage: number
  ) => Promise<IPaginatedResult<IAnimeEpisode>>;
  getAnimeEpisode(id: string, episodeNumber: string): Promise<IAnimeEpisodeDetails | null>;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

interface AnimeProviderProps {
  children: ReactNode;
}

export const AnimeProvider: React.FC<AnimeProviderProps> = ({ children }) => {
  const { isLoading } = useLoading();
  const { getTopAnimes } = useTopAnimes();
  const { searchAnimes } = useAnimeSearch();
  const { getAnimeById, getAnilistAnimeById } = useAnimeDetails();
  const { getLatestEpisodes, getAnimeEpisodes, getAnimeEpisode } = useAnimeEpisodes();

  const value: AnimeContextType = {
    isLoading,
    getTopAnimes,
    getAnimeById,
    searchAnimes,
    getLatestEpisodes,
    getAnimeEpisodes,
    getAnimeEpisode,
    getAnilistAnimeById,
  };

  return (
    <AnimeContext.Provider value={value}>
      {isLoading && <Loading size="large" />}
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
