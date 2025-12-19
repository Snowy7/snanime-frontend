// Global Interfaces for Anime Data
export interface IAnimeSpotlight {
  id: string;
  title: string;
  posterUrl: string;
  bannerUrl: string;
  description: string;
  rank: number;
  type: string;
  duration: string;
  year: number;
  totalEpisodes: number;
  genres?: string[];
  averageScore?: number;
  color?: string; // Anilist cover color for UI theming
}

export interface IAnimeLatest {
  id: string;
  title: string;
  posterUrl: string;
  type?: string;
  status?: string;
  season?: string;
  year?: string | number;
  totalEpisodes?: number;
  latestEpisode?: number; // The most recently released episode number
}

export interface IAnime {
  id: string;
  malId: number;
  title: string;
  synonyms: string[];
  description: string;
  posterUrl: string;
  bannerImage?: string;
  type: string;
  status: string;
  season: string;
  year: string;
  totalEpisodes: number;
  subOrDub: "sub" | "dub" | "both";
  genres: string[];
  averageScore?: number;
  studios?: string[];
  producers?: string[];
  duration?: number;
  score?: number;
  relatedAnime?: SnAnimeRelated[];
  episodes?: IAnimeEpisode[];
}

export interface SnAnimeRelated {
  id: string;
  malId: number;
  title: string;
  type: string;
  status: string;
  relationType: string;
  posterUrl?: string;
  season?: string;
  year?: string;
  totalEpisodes?: number;
  genres?: string[];
  averageScore?: number;
}

export interface IAnimeEpisode {
  id: string;
  number: number;
  title?: string;
  thumbnail?: string;
  duration?: string;
  isFiller?: boolean;
}

export interface IAnimeEpisodeDetails {
  animeId: string; // Unique identifier for the anime
  animeTitle: string; // Title of the anime
  id: string; // Unique identifier for the episode
  number: number; // Episode number
  title: string; // Title of the episode
  isFiller: boolean; // Indicates if the episode is a filler
  description?: string; // Optional episode description
  streams: {
    headers: Record<string, string>; // Headers for the request
    subtitles: Array<{
      url: string; // URL to the subtitle file
      lang: string; // Language of the subtitle
    }>;
    intro: {
      start: number; // Start time in seconds
      end: number; // End time in seconds
    };
    outro: {
      start: number; // Start time in seconds
      end: number; // End time in seconds
    };
    sources: Array<{
      url: string; // URL to the video stream
      isM3U8: boolean; // Indicates if it's an HLS stream
      type: string; // Stream type (e.g., "hls", "mp4")
      quality?: string; // Quality of the stream
      server?: string; // Server name: "AnimeSLayer Original", "Server 4 (streamtape.to)", etc.
      headers?: Record<string, string>; // Headers for the request
      provider?: string; // Provider name (e.g., "hianime", "animekai")
      subtitles?: Array<{ // Subtitles specific to this source
        url: string;
        lang: string;
      }>;
    }>;
  };
  allEpisodes: Array<{
    // List of all episodes
    id: string;
    number: number;
    title: string;
    thumbnail?: string;
  }>;
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
  | "SEARCH_MATCH"
  | "POPULARITY_DESC"
  | "POPULARITY"
  | "TRENDING_DESC"
  | "TRENDING"
  | "UPDATED_AT_DESC"
  | "UPDATED_AT"
  | "START_DATE_DESC"
  | "START_DATE"
  | "END_DATE_DESC"
  | "END_DATE"
  | "FAVOURITES_DESC"
  | "FAVOURITES"
  | "SCORE_DESC"
  | "SCORE"
  | "TITLE_ROMAJI_DESC"
  | "TITLE_ROMAJI"
  | "TITLE_ENGLISH_DESC"
  | "TITLE_ENGLISH"
  | "TITLE_NATIVE_DESC"
  | "TITLE_NATIVE"
  | "EPISODES_DESC"
  | "EPISODES"
  | "ID_DESC"
  | "ID";

export type AnimeType = "ANIME" | "MANGA";

export type AnimeSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export type AnimeFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | "MANGA"
  | "NOVEL"
  | "ONE_SHOT";

export type AnimeStatus = "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
