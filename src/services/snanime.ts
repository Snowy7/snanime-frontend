class SnAnimeService {
  private static instance: SnAnimeService;
  url = "http://localhost:5000";

  public static getInstance(): SnAnimeService {
    if (!SnAnimeService.instance) {
      SnAnimeService.instance = new SnAnimeService();
    }
    return SnAnimeService.instance;
  }

  public async getLatestEpisodes(language: string): Promise<LatestEpisode[]> {
    try {
      const response = await fetch(`${this.url}/anime/latest?language=${language}`);
      if (!response.ok) {
        throw new Error(`Error fetching latest episodes: ${response.statusText}`);
      }
      const data = await response.json();
      return data
        .map((anime: any) => {
          if (!anime.title || anime.id < 0) {
            console.warn("Skipping anime with missing title or invalid id:", anime);
            return null; // Skip this anime
          }

          return {
            id: anime.id,
            title: anime.title,
            episode: anime.episode,
            posterUrl: anime.posterUrl,
            episodeNumber: anime.episodeNumber,
            type: anime.type?.toUpperCase() || "Unknown",
            rating: anime.rating,
            year: anime.year || new Date().getFullYear(),
          } as LatestEpisode;
        })
        .filter((anime: any) => anime !== null); // Filter out null values
    } catch (error) {
      console.error("Error fetching latest episodes:", error);
      throw new Error("Failed to fetch latest episodes");
    }
  }

  public async getTopAnimes(language: string): Promise<Anime[]> {
    try {
      const response = await fetch(`${this.url}/anime/top?language=${language}`);
      if (!response.ok) {
        throw new Error(`Error fetching top animes: ${response.statusText}`);
      }
      const data = await response.json();
      return data
        .map((anime: any) => {
          if (!anime.title || anime.id < 0) {
            console.warn("Skipping anime with missing title or invalid id:", anime);
            return null; // Skip this anime
          }

          return anime as Anime; // Assuming the API returns data in the correct format
        })
        .filter((anime: any) => anime !== null); // Filter out null values
    } catch (error) {
      console.error("Error fetching top animes:", error);
      throw new Error("Failed to fetch top animes");
    }
  }

  public async getAnimeByMalId(id: string | number): Promise<Anime | null> {
    try {
      const response = await fetch(`${this.url}/anime/mal/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching anime by MAL ID: ${response.statusText}`);
      }
      const data = await response.json();
      return data as Anime;
    } catch (error) {
      console.error("Error fetching anime by MAL ID:", error);
      throw new Error("Failed to fetch anime by MAL ID");
    }
  }

  public async getAnimeEpisodes(id: string, page: number = 1, perPage: number = 10): Promise<PaginatedResult<AnimeEpisode>> {
    try {
      const response = await fetch(`${this.url}/anime/${id}/episodes?page=${page}&limit=${perPage}`);
      if (!response.ok) {
        throw new Error(`Error fetching anime episodes: ${response.statusText}`);
      }
      const data = await response.json();
      return {
        ...data,
        items: data.items.map((episode: any) => ({
          title: episode.title,
          thumbnail: episode.thumbnail,
          episodeNumber: episode.episodeNumber,
          episodeString: episode.episodeString,
          duration: episode.duration,
          description: episode.description || "",
        })) as AnimeEpisode[],
      } as PaginatedResult<AnimeEpisode>;
    } catch (error) {
      console.error("Error fetching anime episodes:", error);
      throw new Error("Failed to fetch anime episodes");
    }
  }

  public async getAnimeEpisode(id: string, episodeNumber: number): Promise<EpisodeDetails | null> {
    try {
      const response = await fetch(`${this.url}/anime/${id}/episode/${episodeNumber}`);
      if (!response.ok) {
        throw new Error(`Error fetching anime episode: ${response.statusText}`);
      }
      const data = await response.json();
      return data as EpisodeDetails;
    } catch (error) {
      console.error("Error fetching anime episode:", error);
      throw new Error("Failed to fetch anime episode");
    }
  }

  public async searchAnime(query: string, page: number = 1, perPage: number = 10): Promise<PaginatedResult<SearchResult>> {
    try {
      const response = await fetch(`${this.url}/anime/search?query=${encodeURIComponent(query)}&page=${page}&limit=${perPage}`);
      if (!response.ok) {
        throw new Error(`Error searching anime: ${response.statusText}`);
      }
      const data = await response.json();
      return {
        ...data,
        items: data.items.map((anime: any) => ({
          ...anime,
          id: anime.id || -1, // Ensure id is always a number
        })) as Anime[],
      } as PaginatedResult<SearchResult>;
    } catch (error) {
      console.error("Error searching anime:", error);
      throw new Error("Failed to search anime");
    }
  }
}

export { SnAnimeService };
