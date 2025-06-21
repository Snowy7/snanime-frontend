import axios from "axios";

const BASE_URL = "https://graphql.anilist.co";

// AniList specific types
interface AniListRequestOptions {
  timeout?: number;
  retries?: number;
}

interface AniListReqOptions {
  method: string;
  headers: Record<string, string>;
  body: string;
}

// AniList GraphQL response types
interface AniListCoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

interface AniListTitle {
  english?: string;
  romaji?: string;
  native?: string;
  userPreferred?: string;
}

interface AniListDate {
  year?: number;
  month?: number;
  day?: number;
}

interface AniListGenre {
  name: string;
}

interface AniListStudio {
  name: string;
  isMain: boolean;
}

interface AniListCharacterEdge {
  role: string;
  node: {
    id: number;
    name: {
      userPreferred: string;
    };
    image: {
      large: string;
    };
  };
}

interface AniListRelationEdge {
  relationType: string;
  node: {
    id: number;
    title: AniListTitle;
    type: string;
    status: string;
    coverImage: AniListCoverImage;
    seasonYear?: number;
  };
}

interface AniListStaffEdge {
  role: string;
  id: number;
  node: {
    name: {
      userPreferred: string;
    };
    image: {
      large: string;
    };
  };
}

interface AniListMedia {
  id: number;
  idMal?: number;
  title: AniListTitle;
  description?: string;
  coverImage: AniListCoverImage;
  bannerImage?: string;
  episodes?: number;
  status: string;
  type: string;
  format: string;
  genres: string[];
  averageScore?: number;
  meanScore?: number;
  startDate: AniListDate;
  endDate: AniListDate;
  season?: string;
  seasonYear?: number;
  studios: {
    edges: Array<{
      isMain: boolean;
      node: AniListStudio;
    }>;
  };
  source?: string;
  characters: {
    edges: AniListCharacterEdge[];
  };
  relations: {
    edges: AniListRelationEdge[];
  };
  staff: {
    edges: AniListStaffEdge[];
  };
  synonyms: string[];
  externalLinks: Array<{
    url: string;
    site: string;
  }>;
}

interface AniListPageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

interface AniListMediaResponse {
  data: {
    Media: AniListMedia;
  };
}

interface AniListSearchResponse {
  data: {
    Page: {
      pageInfo: AniListPageInfo;
      media: AniListMedia[];
    };
  };
}

// Exception classes
class AniListException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AniListException";
  }
}

class TimeOutException extends AniListException {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = "TimeOutException";
  }
}

class NoIdException extends AniListException {
  constructor(type: string) {
    super(`No ID provided for ${type}`);
    this.name = "NoIdException";
  }
}

// API class for handling GraphQL requests
class AniListAPI {
  private options?: AniListRequestOptions;

  constructor(options?: AniListRequestOptions) {
    this.options = options;
  }

  async query<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    if (!query) throw new Error("No query provided");

    const options: AniListReqOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: variables || {},
      }),
    };

    try {
      const res = await fetch(BASE_URL, options);
      const { status, statusText } = res;

      if (status !== 200) {
        if (statusText) {
          throw new Error(`AniList API returned with a ${status} status. ${statusText}`);
        }
        throw new Error(`AniList API returned with a ${status} status. The API might be down!`);
      }

      const result = await res.json();

      if (result.errors) {
        throw new Error(`GraphQL Error: ${result.errors[0].message}`);
      }

      return result as T;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw new TimeOutException(this.options?.timeout || 5000);
      }
      throw new Error((error as Error).message);
    }
  }
}

// Main AniList service class
class AniListService {
  private api: AniListAPI;
  private static instance: AniListService;

  constructor(options?: AniListRequestOptions) {
    this.api = new AniListAPI(options);
  }

  public static getInstance(options?: AniListRequestOptions): AniListService {
    if (!AniListService.instance) {
      AniListService.instance = new AniListService(options);
    }
    return AniListService.instance;
  }

  private mapAniListToAnime(media: AniListMedia): Anime {
    const title = media.title.english || media.title.romaji || media.title.userPreferred || "Unknown Title";
    const year = media.startDate?.year || media.seasonYear || 0;
    const rating = (media.averageScore || media.meanScore || 0) / 10; // Convert from 0-100 to 0-10 scale
    const studio = media.studios.edges.find((edge) => edge.isMain)?.node.name || media.studios.edges[0]?.node.name || undefined;

    return {
      id: media.id.toString(),
      title,
      description: media.description?.replace(/<[^>]*>/g, "") || "", // Remove HTML tags
      posterUrl: media.coverImage.extraLarge || media.coverImage.large || media.coverImage.medium || "",
      bannerUrl: media.bannerImage || media.coverImage.extraLarge || "",
      rating,
      year,
      status: this.mapStatus(media.status),
      type: this.mapType(media.format || media.type),
      genres: media.genres || [],
      sub: "Sub", // AniList doesn't provide dub info directly
      episodesCount: media.episodes,
      studio,
      source: media.source,
      related:
        media.relations?.edges.map((edge) => ({
          id: edge.node.id.toString(),
          title: edge.node.title.english || edge.node.title.romaji || edge.node.title.userPreferred || "Unknown Title",
          type: this.mapType(edge.node.type),
          status: this.mapStatus(edge.node.status),
          posterUrl: edge.node.coverImage.extraLarge || edge.node.coverImage.large || edge.node.coverImage.medium || "",
          year: edge.node.seasonYear || 0,
        })) || [],
      characters:
        media.characters?.edges.map((edge) => ({
          id: edge.node.id.toString(),
          name: edge.node.name.userPreferred || "Unknown Name",
          role: edge.role || "Unknown Role",
          imageUrl: edge.node.image.large || "",
        })) || [],
      staff:
        media.staff?.edges.map((edge) => ({
          id: edge.id.toString(),
          name: edge.node.name.userPreferred || "Unknown Name",
          role: edge.role || "Unknown Role",
          imageUrl: edge.node.image.large || "",
        })) || [],
    };
  }

  private mapStatus(status: string): string {
    switch (status) {
      case "FINISHED":
        return "Completed";
      case "RELEASING":
        return "Airing";
      case "NOT_YET_RELEASED":
        return "Not Yet Aired";
      case "CANCELLED":
        return "Cancelled";
      case "HIATUS":
        return "On Hiatus";
      default:
        return "Unknown";
    }
  }

  private mapType(format: string): AnimeType {
    switch (format) {
      case "TV":
        return "TV";
      case "TV_SHORT":
        return "TV";
      case "MOVIE":
        return "Movie";
      case "SPECIAL":
        return "Special";
      case "OVA":
        return "OVA";
      case "ONA":
        return "ONA";
      case "MUSIC":
        return "Music";
      default:
        return "Unknown";
    }
  }

  public async getAnimeById(id: number): Promise<Anime> {
    if (!id) throw new NoIdException("anime");

    const query = `
      query GetAnime($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal
          title {
            english
            romaji
            native
            userPreferred
          }
          description
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          episodes
          status
          type
          format
          genres
          averageScore
          meanScore
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          studios {
            edges {
              isMain
              node {
                name
              }
            }
          }
          source
          synonyms
          characters {
            edges {
              role
              node {
                id
                name {
                  userPreferred
                }
                image {
                  large
                }
              }
            }
          }
          relations {
            edges {
              relationType
              node {
                id
                title {
                  english
                  romaji
                  native
                  userPreferred
                }
                type
                status
                coverImage {
                  extraLarge
                  large
                  medium
                }
                seasonYear
              }
            }
          }
          staff {
            edges {
              id
              role
              node {
                image {
                  large
                }
                name {
                  userPreferred
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.api.query<AniListMediaResponse>(query, { id });
    return this.mapAniListToAnime(response.data.Media);
  }

  public async getAnimeByMalId(malId: number): Promise<Anime> {
    if (!malId) throw new NoIdException("anime");

    const query = `
      query GetAnimeByMal($malId: Int) {
        Media(idMal: $malId, type: ANIME) {
          id
          idMal
          title {
            english
            romaji
            native
            userPreferred
          }
          description
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          episodes
          status
          type
          format
          genres
          averageScore
          meanScore
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          studios {
            edges {
              isMain
              node {
                name
              }
            }
          }
          source
          synonyms
                    characters {
            edges {
              role
              node {
                id
                name {
                  userPreferred
                }
                image {
                  large
                }
              }
            }
          }
          relations {
            edges {
              relationType
              node {
                id
                title {
                  english
                  romaji
                  native
                  userPreferred
                }
                type
                status
                coverImage {
                  extraLarge
                  large
                  medium
                }
                seasonYear
              }
            }
          }
          staff {
            edges {
              id
              role
              node {
                image {
                  large
                }
                name {
                  userPreferred
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.api.query<AniListMediaResponse>(query, { malId });
    return this.mapAniListToAnime(response.data.Media);
  }

  public async getTopAnime(page: number = 1, perPage: number = 10): Promise<Anime[]> {
    const query = `
      query GetTopAnime($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, sort: [SCORE_DESC, POPULARITY_DESC]) {
            id
            idMal
            title {
              english
              romaji
              native
              userPreferred
            }
            description
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            episodes
            status
            type
            format
            genres
            averageScore
            meanScore
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            studios {
              edges {
                isMain
                node {
                  name
                }
              }
            }
            source
            synonyms
          }
        }
      }
    `;

    const response = await this.api.query<AniListSearchResponse>(query, { page, perPage });
    return response.data.Page.media.map((media) => this.mapAniListToAnime(media));
  }

  public async getPopularAnime(page: number = 1, perPage: number = 10): Promise<Anime[]> {
    const query = `
      query GetPopularAnime($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, sort: [POPULARITY_DESC, SCORE_DESC]) {
            id
            idMal
            title {
              english
              romaji
              native
              userPreferred
            }
            description
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            episodes
            status
            type
            format
            genres
            averageScore
            meanScore
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            studios {
              edges {
                isMain
                node {
                  name
                }
              }
            }
            source
            synonyms
          }
        }
      }
    `;

    const response = await this.api.query<AniListSearchResponse>(query, { page, perPage });
    return response.data.Page.media.map((media) => this.mapAniListToAnime(media));
  }

  public async getTrendingAnime(page: number = 1, perPage: number = 10): Promise<Anime[]> {
    const query = `
      query GetTrendingAnime($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
            id
            idMal
            title {
              english
              romaji
              native
              userPreferred
            }
            description
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            episodes
            status
            type
            format
            genres
            averageScore
            meanScore
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            studios {
              edges {
                isMain
                node {
                  name
                }
              }
            }
            source
            synonyms
          }
        }
      }
    `;

    const response = await this.api.query<AniListSearchResponse>(query, { page, perPage });
    return response.data.Page.media.map((media) => this.mapAniListToAnime(media));
  }

  public async getLatestAnime(page: number = 1, perPage: number = 10): Promise<Anime[]> {
    const query = `
      query GetLatestAnime($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, sort: [UPDATED_AT_DESC], isAdult: false) {
            id
            idMal
            title {
              english
              romaji
              native
              userPreferred
            }
            description
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            episodes
            status
            type
            format
            genres
            averageScore
            meanScore
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            studios {
              edges {
                isMain
                node {
                  name
                }
              }
            }
            source
            synonyms
          }
        }
      }
    `;

    const response = await this.api.query<AniListSearchResponse>(query, { page, perPage });
    return response.data.Page.media.map((media) => this.mapAniListToAnime(media));
  }

  public async searchAnime(searchTerm: string, page: number = 1, perPage: number = 10): Promise<Anime[]> {
    if (!searchTerm.trim()) {
      throw new Error("Search term cannot be empty");
    }

    const query = `
      query SearchAnime($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, search: $search, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
            id
            idMal
            title {
              english
              romaji
              native
              userPreferred
            }
            description
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            episodes
            status
            type
            format
            genres
            averageScore
            meanScore
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            studios {
              edges {
                isMain
                node {
                  name
                }
              }
            }
            source
            synonyms
          }
        }
      }
    `;

    const response = await this.api.query<AniListSearchResponse>(query, {
      search: searchTerm,
      page,
      perPage,
    });
    return response.data.Page.media.map((media) => this.mapAniListToAnime(media));
  }

  public async getSeasonalAnime(season: string, year: number, page: number = 1, perPage: number = 10): Promise<Anime[]> {
    const seasonEnum = season.toUpperCase();

    const query = `
      query GetSeasonalAnime($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, season: $season, seasonYear: $year, sort: [POPULARITY_DESC, SCORE_DESC]) {
            id
            idMal
            title {
              english
              romaji
              native
              userPreferred
            }
            description
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            episodes
            status
            type
            format
            genres
            averageScore
            meanScore
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            studios {
              edges {
                isMain
                node {
                  name
                }
              }
            }
            source
            synonyms
          }
        }
      }
    `;

    const response = await this.api.query<AniListSearchResponse>(query, {
      season: seasonEnum,
      year,
      page,
      perPage,
    });
    return response.data.Page.media.map((media) => this.mapAniListToAnime(media));
  }

  public async getAnimeByGenre(genre: string, page: number = 1, perPage: number = 10): Promise<Anime[]> {
    const query = `
      query GetAnimeByGenre($genre: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, genre: $genre, sort: [POPULARITY_DESC, SCORE_DESC]) {
            id
            idMal
            title {
              english
              romaji
              native
              userPreferred
            }
            description
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            episodes
            status
            type
            format
            genres
            averageScore
            meanScore
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            studios {
              edges {
                isMain
                node {
                  name
                }
              }
            }
            source
            synonyms
          }
        }
      }
    `;

    const response = await this.api.query<AniListSearchResponse>(query, {
      genre,
      page,
      perPage,
    });
    return response.data.Page.media.map((media) => this.mapAniListToAnime(media));
  }
}

export { AniListService };
export { AniListException, TimeOutException, NoIdException };
