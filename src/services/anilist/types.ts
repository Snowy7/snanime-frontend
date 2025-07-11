import { AnimeFormat, AnimeSeason, AnimeSort, AnimeStatus, AnimeType } from "@/types/anime";

export interface IAnilistAnimeData {
  id: number;
  idMal: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
    userPreferred: string;
  };
  description: string | null;
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string | null;
  };
  bannerImage: string | null;
  genres: string[];
  status: string;
  episodes: number | null;
  duration: number | null;
  averageScore: number | null;
  meanScore: number | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  season: AnimeSeason | null;
  seasonYear: number | null;
  format: AnimeFormat | null;
  type: AnimeType;
  studios: {
    edges: Array<{
      isMain: boolean;
      node: {
        name: string;
      };
    }>;
  };
  source: string | null;
  synonyms: string[];
}

export interface IAnilistPageInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface IAnilistResponse<T> {
  data: {
    Media: T;
  };
}

export interface IAnilistSearchResponse {
  data: {
    Page: {
      pageInfo: IAnilistPageInfo;
      media: IAnilistAnimeData[];
    };
  };
  errors?: Array<{
    message: string;
    status?: number;
    locations?: Array<{ line: number; column: number }>;
  }>;
}

export interface IAnilistSearchVariables {
  page?: number;
  perPage?: number;
  search?: string;
  type?: AnimeType;
  season?: AnimeSeason;
  format?: AnimeFormat[];
  status?: AnimeStatus;
  genres?: string[];
  excludedGenres?: string[];
  seasonYear?: number;
  sort?: AnimeSort[];
  isAdult?: boolean;
} 