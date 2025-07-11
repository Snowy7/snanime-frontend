const url = process.env.NEXT_PUBLIC_SNANIME_URL || "http://localhost:5000/api/v1";

class SnAnimeService {
  private static instance: SnAnimeService;

  private constructor() {}

  public static getInstance(): SnAnimeService {
    if (!SnAnimeService.instance) {
      SnAnimeService.instance = new SnAnimeService();
    }
    return SnAnimeService.instance;
  }

  public async getSpotlight(
    language: string = "en"
  ): Promise<SnAnimePaginatedResult<SnAnimeSpotlight>> {
    try {
      const response = await fetch(`${url}/anime/spotlight?language=${language}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching spotlight:", error);
      throw error;
    }
  }

  public async getLatestEpisodes(
    language: string = "en"
  ): Promise<SnAnimePaginatedResult<SnAnimeRecentlyUpdated>> {
    try {
      const response = await fetch(`${url}/anime/latest-episodes?language=${language}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching latest episodes:", error);
      throw error;
    }
  }

  public async getAnimeInfo(animeId: string, language: string = "en"): Promise<SnAnimeData> {
    try {
      const response = await fetch(`${url}/anime/info/${animeId}?language=${language}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching anime info:", error);
      throw error;
    }
  }

  public async getAnimeEpisode(
    animeId: string,
    episodeNumber: number,
    language: string = "en"
  ): Promise<SnEpisodeDetails> {
    try {
      const response = await fetch(
        `${url}/anime/watch?animeId=${animeId}&episodeNumber=${episodeNumber}&language=${language}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching anime episode streams:", error);
      throw error;
    }
  }

  public async searchAnime(
    query: string,
    language: string = "en"
  ): Promise<SnAnimePaginatedResult<SnAnimeSearchResult>> {
    try {
      const response = await fetch(`${url}/anime/search?query=${query}&language=${language}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error searching anime:", error);
      throw error;
    }
  }
}

export { SnAnimeService };
