// Global Interfaces for Anime Data
export interface IAnime {
  id: string;
  malId?: number;
  title: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  genres: string[];
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED';
  episodes?: number;
  duration?: number;
  rating?: number;
  startDate?: string;
  endDate?: string;
  type?: AnimeType;
  format?: AnimeFormat;
  season?: AnimeSeason;
}

export interface IAnimeEpisode {
  id: string;
  number: number;
  title?: string;
  thumbnail?: string;
  duration?: number;
}

export interface IAnimeEpisodeDetails extends IAnimeEpisode {
  streams: {
    sources: Array<{
      url: string;
      quality: string;
      isM3U8: boolean;
    }>;
    subtitles?: Array<{
      url: string;
      lang: string;
    }>;
  };
}

// Generic Pagination Interface
export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Search Result Interface
export interface IAnimeSearchResult {
  id: string;
  title: string;
  coverImage: string;
  bannerImage?: string;
  description?: string;
  format?: AnimeFormat;
  status?: AnimeStatus;
  episodes?: number;
  season?: AnimeSeason;
  seasonYear?: number;
  genres?: string[];
  rating?: number;
  studios?: { name: string; isMain: boolean }[];
}

// Search Parameters Interface
export interface IAnimeSearchParams {
  query: string;
  page: number;
  perPage: number;
  format?: AnimeFormat[];
  season?: AnimeSeason;
  seasonYear?: number;
  status?: AnimeStatus;
  genres?: string[];
  sort?: AnimeSort[];
}

// Enums for search parameters
export type AnimeSort = 
  | 'SEARCH_MATCH'
  | 'POPULARITY_DESC' 
  | 'POPULARITY' 
  | 'TRENDING_DESC' 
  | 'TRENDING' 
  | 'UPDATED_AT_DESC' 
  | 'UPDATED_AT' 
  | 'START_DATE_DESC' 
  | 'START_DATE' 
  | 'END_DATE_DESC' 
  | 'END_DATE' 
  | 'FAVOURITES_DESC' 
  | 'FAVOURITES' 
  | 'SCORE_DESC' 
  | 'SCORE' 
  | 'TITLE_ROMAJI_DESC' 
  | 'TITLE_ROMAJI' 
  | 'TITLE_ENGLISH_DESC' 
  | 'TITLE_ENGLISH' 
  | 'TITLE_NATIVE_DESC' 
  | 'TITLE_NATIVE' 
  | 'EPISODES_DESC' 
  | 'EPISODES' 
  | 'ID_DESC' 
  | 'ID';

export type AnimeType = 'ANIME' | 'MANGA';

export type AnimeSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export type AnimeFormat = 
  | 'TV' 
  | 'TV_SHORT' 
  | 'MOVIE' 
  | 'SPECIAL' 
  | 'OVA' 
  | 'ONA' 
  | 'MUSIC' 
  | 'MANGA' 
  | 'NOVEL' 
  | 'ONE_SHOT';

export type AnimeStatus = 
  | 'FINISHED'
  | 'RELEASING'
  | 'NOT_YET_RELEASED'
  | 'CANCELLED'
  | 'HIATUS'; 