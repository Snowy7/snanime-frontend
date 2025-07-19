/**
 * Base response format for all API responses
 */
export interface ISnAnimeApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
  version: string;
}

/**
 * Pagination query parameters
 */
export interface ISnAnimePaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination result format
 */
export interface ISnAnimePaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Validation error format
 */
export interface ISnAnimeValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Anime information response type
 */
export interface ISnAnimeInfo {
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
  relatedAnime?: Array<{
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
  }>;
}

/**
 * Latest anime response type
 */
export interface ISnAnimeLatest {
  id: string;
  title: string;
  posterUrl: string;
  type: string;
  status: string;
  season: string;
  year: string;
  totalEpisodes: number;
}

/**
 * Spotlight anime response type
 */
export interface ISnAnimeSpotlight {
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
}

/**
 * Episode details response type
 */
export interface ISnAnimeEpisodeDetails {
  animeId: string;          // Unique identifier for the anime
  animeTitle: string;       // Title of the anime
  id: string;              // Unique identifier for the episode
  number: number;          // Episode number
  title: string;           // Title of the episode
  isFiller: boolean;       // Indicates if the episode is a filler
  description?: string;    // Optional episode description
  streams: {
    headers: Record<string, string>;  // Headers for the request
    subtitles: Array<{
      url: string;        // URL to the subtitle file
      lang: string;       // Language of the subtitle
    }>;
    intro: {
      start: number;      // Start time in seconds
      end: number;        // End time in seconds
    };
    outro: {
      start: number;      // Start time in seconds
      end: number;        // End time in seconds
    };
    sources: Array<{
      url: string;        // URL to the video stream
      isM3U8: boolean;    // Indicates if it's an HLS stream
      type: string;       // Stream type (e.g., "hls", "mp4")
    }>;
  };
  allEpisodes: Array<{    // List of all episodes
    id: string;
    number: number;
    title: string;
  }>;
}

/**
 * Health check response type
 */
export interface ISnAnimeHealthCheck {
  status: string;
  timestamp: string;
  version: string;
} 