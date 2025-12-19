import {
  IAnime,
  IAnimeSearchResult,
  AnimeStatus,
  AnimeType,
  AnimeSeason,
  IAnimeLatest,
  IAnimeSpotlight,
  IPaginatedResult,
} from "@/types/anime";
import {
  ISnAnimeApiResponse,
  ISnAnimeInfo,
  ISnAnimeLatest,
  ISnAnimePaginationQuery,
  ISnAnimePaginationResult,
  ISnAnimeSpotlight,
  ISnAnimeHealthCheck,
  ISnAnimeEpisodeDetails,
} from "./types";

/**
 * Service class for interacting with the SnAnime API v2
 * No authentication required - public API
 */
export class SnAnimeService {
  private static instance: SnAnimeService;
  // Use API v2 - no auth required
  private baseUrl =
    process.env.NEXT_PUBLIC_SNANIME_API_URL || "http://localhost:3000";

  private constructor() {}

  /**
   * Get singleton instance of SnAnimeService
   */
  public static getInstance(): SnAnimeService {
    if (!SnAnimeService.instance) {
      SnAnimeService.instance = new SnAnimeService();
    }
    return SnAnimeService.instance;
  }

  /**
   * Add language parameter to URL
   */
  private addLanguageToUrl(url: string, language: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}language=${language}`;
  }

  /**
   * Map status string to global AnimeStatus type
   */
  private mapStatusToGlobal(status: string): IAnime["status"] {
    const statusMap: { [key: string]: IAnime["status"] } = {
      FINISHED: "FINISHED",
      RELEASING: "RELEASING",
      NOT_YET_RELEASED: "NOT_YET_RELEASED",
      CANCELLED: "CANCELLED",
    };
    return statusMap[status.toUpperCase()] || "NOT_YET_RELEASED";
  }

  /**
   * Map type string to global AnimeType
   */
  private mapTypeToGlobal(type: string): AnimeType {
    return type.toUpperCase() === "MANGA" ? "MANGA" : "ANIME";
  }

  /**
   * Map season string to global AnimeSeason
   */
  private mapSeasonToGlobal(season: string): AnimeSeason {
    const seasonMap: { [key: string]: AnimeSeason } = {
      WINTER: "WINTER",
      SPRING: "SPRING",
      SUMMER: "SUMMER",
      FALL: "FALL",
    };
    return seasonMap[season.toUpperCase()];
  }

  /**
   * Map SnAnime API response to global anime type
   */
  private mapToGlobalAnime(snAnime: ISnAnimeInfo): IAnime {
    return snAnime;
  }

  /**
   * Map SnAnime API response to global search result type
   */
  private mapToGlobalSearchResult(
    snResult: ISnAnimeLatest | ISnAnimeSpotlight
  ): IAnimeSearchResult {
    return {
      id: snResult.id,
      title: snResult.title,
      coverImage: snResult.posterUrl,
      episodes: snResult.totalEpisodes,
    };
  }

  /**
   * Get anime information by MAL ID
   * API v2 uses MAL ID directly without prefixes
   */
  public async getAnimeInfo(id: string, language: string = "en"): Promise<IAnime | null> {
    try {
      // Remove any provider prefix (e.g., "3:12345" -> "12345")
      const malId = id.includes(':') ? id.split(':')[1] : id;
      const url = this.addLanguageToUrl(`${this.baseUrl}/anime/${malId}`, language);
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        console.error("Error fetching anime info:", response.status);
        return null;
      }

      const data = (await response.json()) as ISnAnimeInfo;

      if (!data || data.hasOwnProperty("error")) {
        console.error("Error fetching anime info:", data);
        return null;
      }

      return this.mapToGlobalAnime(data);
    } catch (error) {
      console.error("Error fetching anime info:", error);
      return null;
    }
  }

  /**
   * Get latest anime releases
   */
  public async getLatestAnime(
    params?: ISnAnimePaginationQuery,
    language: string = "en"
  ): Promise<IPaginatedResult<IAnimeLatest> | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page);
      if (params?.limit) queryParams.set('limit', params.limit);
      queryParams.set('language', language);
      
      const response = await fetch(`${this.baseUrl}/anime/latest?${queryParams}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        console.error("Error fetching latest anime:", response.status);
        return null;
      }

      const data = (await response.json()) as ISnAnimePaginationResult<ISnAnimeLatest>;

      if (!data.data || !data.pagination) {
        console.error("Error fetching latest anime:", data);
        return null;
      }

      return {
        items: data.data,
        total: data.pagination.total,
        currentPage: data.pagination.page,
        totalPages: data.pagination.totalPages,
        hasNextPage: data.pagination.hasNext,
        hasPreviousPage: data.pagination.hasPrev,
      };
    } catch (error) {
      console.error("Error fetching latest anime:", error);
      return null;
    }
  }

  /**
   * Get spotlight anime (trending from Anilist)
   */
  public async getSpotlightAnime(language: string = "en"): Promise<IAnimeSpotlight[] | null> {
    try {
      const url = this.addLanguageToUrl(`${this.baseUrl}/anime/spotlight`, language);
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        console.error("Error fetching spotlight anime:", response.status);
        return null;
      }

      const data = (await response.json()) as ISnAnimeSpotlight[];

      if (!data || !Array.isArray(data)) {
        console.error("Error fetching spotlight anime:", data);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching spotlight anime:", error);
      return null;
    }
  }

  /**
   * Get trending anime (sorted by trending score)
   */
  public async getTrendingAnime(page: number = 1, limit: number = 20): Promise<IAnimeSpotlight[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/anime/trending?page=${page}&limit=${limit}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        console.error("Error fetching trending anime:", response.status);
        return null;
      }

      const data = (await response.json()) as ISnAnimeSpotlight[];

      if (!data || !Array.isArray(data)) {
        console.error("Error fetching trending anime:", data);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching trending anime:", error);
      return null;
    }
  }

  /**
   * Get popular anime (sorted by popularity)
   */
  public async getPopularAnime(page: number = 1, limit: number = 20): Promise<IAnimeSpotlight[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/anime/popular?page=${page}&limit=${limit}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        console.error("Error fetching popular anime:", response.status);
        return null;
      }

      const data = (await response.json()) as ISnAnimeSpotlight[];

      if (!data || !Array.isArray(data)) {
        console.error("Error fetching popular anime:", data);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching popular anime:", error);
      return null;
    }
  }

  /**
   * Get top rated anime (sorted by average score)
   */
  public async getTopRatedAnime(page: number = 1, limit: number = 20): Promise<IAnimeSpotlight[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/anime/top-rated?page=${page}&limit=${limit}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        console.error("Error fetching top rated anime:", response.status);
        return null;
      }

      const data = (await response.json()) as ISnAnimeSpotlight[];

      if (!data || !Array.isArray(data)) {
        console.error("Error fetching top rated anime:", data);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching top rated anime:", error);
      return null;
    }
  }

  /**
   * Get currently airing anime
   */
  public async getAiringAnime(page: number = 1, limit: number = 20): Promise<IAnimeSpotlight[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/anime/airing?page=${page}&limit=${limit}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        console.error("Error fetching airing anime:", response.status);
        return null;
      }

      const data = (await response.json()) as ISnAnimeSpotlight[];

      if (!data || !Array.isArray(data)) {
        console.error("Error fetching airing anime:", data);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching airing anime:", error);
      return null;
    }
  }

  /**
   * Get optimized image through proxy
   */
  public getProxyImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    const encodedUrl = encodeURIComponent(imageUrl);
    return `${this.baseUrl}/proxy/image?url=${encodedUrl}`;
  }

  /**
   * Get optimized video through proxy
   */
  public getProxyVideoUrl(videoUrl: string): string {
    if (!videoUrl) return '';
    const encodedUrl = encodeURIComponent(videoUrl);
    return `${this.baseUrl}/proxy/video?url=${encodedUrl}`;
  }

  /**
   * Get M3U8/HLS playlist through proxy (with URL rewriting)
   */
  public getProxyM3U8Url(m3u8Url: string): string {
    if (!m3u8Url) return '';
    const encodedUrl = encodeURIComponent(m3u8Url);
    return `${this.baseUrl}/proxy/m3u8?url=${encodedUrl}`;
  }

  /**
   * Get subtitle through proxy
   */
  public getProxySubtitleUrl(subtitleUrl: string): string {
    if (!subtitleUrl) return '';
    const encodedUrl = encodeURIComponent(subtitleUrl);
    return `${this.baseUrl}/proxy/subtitle?url=${encodedUrl}`;
  }

  /**
   * Get episode details by MAL ID and episode number
   */
  public async getEpisodeDetails(animeId: string, episodeNumber: string, language: string = "en"): Promise<ISnAnimeEpisodeDetails | null> {
    try {
      // Remove any provider prefix
      const malId = animeId.includes(':') ? animeId.split(':')[1] : animeId;
      const url = this.addLanguageToUrl(`${this.baseUrl}/anime/${malId}/episode/${episodeNumber}`, language);
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        console.error("Error fetching episode details:", response.status);
        return null;
      }

      const data = (await response.json()) as ISnAnimeEpisodeDetails;

      if (data.hasOwnProperty("error")) {
        console.error("Error fetching episode details:", (data as any).error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching episode details:", error);
      return null;
    }
  }

  /**
   * Check API health status
   */
  public async checkHealth(): Promise<ISnAnimeHealthCheck | null> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = (await response.json()) as ISnAnimeApiResponse<ISnAnimeHealthCheck>;

      if (!data.success || !data.data) {
        console.error("Error checking health:", data.message);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error("Error checking health:", error);
      return null;
    }
  }
}
