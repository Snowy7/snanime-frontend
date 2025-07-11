export interface ISnAnimeData {
  id: string;
  malId?: number;
  title: string;
  description: string;
  image: string;
  cover?: string;
  genres: string[];
  status: string;
  totalEpisodes?: number;
  duration?: string;
  rating?: number;
  releaseDate?: string;
  endDate?: string;
}

export interface ISnAnimeEpisode {
  id: string;
  episodeNumber: number;
  title?: string;
  image?: string;
  duration?: string;
}

export interface ISnAnimeEpisodeDetails extends ISnAnimeEpisode {
  streams: {
    sources: Array<{
      url: string;
      quality: string;
      isM3U8: boolean;
    }>;
    subtitles?: Array<{
      url: string;
      language: string;
    }>;
  };
}

export interface ISnAnimePaginatedResult<T> {
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
  results: T[];
}

export interface ISnAnimeSearchResult {
  id: string;
  title: string;
  image: string;
  type?: string;
  releaseDate?: string;
}

export interface ISnAnimeSpotlight {
  id: string;
  title: string;
  image: string;
  description: string;
}

export interface ISnAnimeRecentlyUpdated {
  id: string;
  episodeNumber: number;
  title: string;
  image: string;
  releaseDate: string;
} 