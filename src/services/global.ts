import { AniListService } from "./anilist/service";
import { SnAnimeService } from "./snanime/service";

// Create global instances
export const anilistService = AniListService.getInstance();
export const snanimeService = SnAnimeService.getInstance();

// Create a wrapper service that automatically passes language
export class SnAnimeServiceWrapper {
  private static instance: SnAnimeServiceWrapper;
  private snAnimeService: SnAnimeService;

  private constructor() {
    this.snAnimeService = SnAnimeService.getInstance();
  }

  public static getInstance(): SnAnimeServiceWrapper {
    if (!SnAnimeServiceWrapper.instance) {
      SnAnimeServiceWrapper.instance = new SnAnimeServiceWrapper();
    }
    return SnAnimeServiceWrapper.instance;
  }

  public async getAnimeInfo(id: string, language: string) {
    return this.snAnimeService.getAnimeInfo(id, language);
  }

  public async getLatestAnime(params?: any, language: string = "en") {
    return this.snAnimeService.getLatestAnime(params, language);
  }

  public async getSpotlightAnime(language: string = "en") {
    return this.snAnimeService.getSpotlightAnime(language);
  }

  public async getEpisodeDetails(animeId: string, episodeNumber: string, language: string = "en") {
    return this.snAnimeService.getEpisodeDetails(animeId, episodeNumber, language);
  }

  public getProxyImageUrl(imageUrl: string) {
    return this.snAnimeService.getProxyImageUrl(imageUrl);
  }

  public getProxyVideoUrl(videoUrl: string) {
    return this.snAnimeService.getProxyVideoUrl(videoUrl);
  }

  public async checkHealth() {
    return this.snAnimeService.checkHealth();
  }
}

// Export the wrapper instance
export const snanimeServiceWrapper = SnAnimeServiceWrapper.getInstance(); 