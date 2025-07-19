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
 * Service class for interacting with the SnAnime API
 */
export class SnAnimeService {
  private static instance: SnAnimeService;
  private baseUrl =
    process.env.NEXT_PUBLIC_SNANIME_API_URL || "https://snanime-api.snowydev.xyz/api/v1";

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
   * Get anime information by ID
   */
  public async getAnimeInfo(id: string, language: string = "en"): Promise<IAnime | null> {
    try {
      const url = this.addLanguageToUrl(`${this.baseUrl}/anime/info/${id}`, language);
      const response = await fetch(url);
      const data = (await response.json()) as ISnAnimeInfo;

      if (!data) {
        console.error("Error fetching anime info:", data);
        return null;
      }

      // if includes error, return null
      if (data.hasOwnProperty("error")) {
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
      const queryParams = new URLSearchParams(params as Record<string, string>);
      queryParams.set('language', language);
      const response = await fetch(`${this.baseUrl}/anime/latest?${queryParams}`);
      const data = (await response.json()) as ISnAnimePaginationResult<ISnAnimeLatest>;

      if (!data.data || !data.pagination) {
        console.error("Error fetching latest anime:", data.data);
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
   * Get spotlight anime
   */
  public async getSpotlightAnime(language: string = "en"): Promise<IAnimeSpotlight[] | null> {
    try {
      const url = this.addLanguageToUrl(`${this.baseUrl}/anime/spotlight`, language);
      const response = await fetch(url);
      const data = (await response.json()) as ISnAnimeSpotlight[];

      if (!data) {
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
   * Get optimized image through proxy
   */
  public getProxyImageUrl(imageUrl: string): string {
    const encodedUrl = encodeURIComponent(imageUrl);
    return `${this.baseUrl}/proxy/image?url=${encodedUrl}`;
  }

  /**
   * Get optimized video through proxy
   */
  public getProxyVideoUrl(videoUrl: string): string {
    const encodedUrl = encodeURIComponent(videoUrl);
    return `${this.baseUrl}/proxy/video?url=${encodedUrl}`;
  }

  /**
   * Get episode details by anime ID and episode number
   */
  public async getEpisodeDetails(animeId: string, episodeNumber: string, language: string = "en"): Promise<ISnAnimeEpisodeDetails | null> {
    try {
      const url = this.addLanguageToUrl(`${this.baseUrl}/anime/episode/${animeId}/${episodeNumber}`, language);
      const response = await fetch(url);
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
