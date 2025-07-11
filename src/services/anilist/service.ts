import { IAnime, IAnimeSearchParams, IAnimeSearchResult, IPaginatedResult } from '@/types/anime';
import { IAnilistAnimeData, IAnilistResponse, IAnilistSearchResponse, IAnilistSearchVariables } from './types';

export class AniListService {
  private static instance: AniListService;
  private baseUrl = 'https://graphql.anilist.co';

  private constructor() {}

  public static getInstance(): AniListService {
    if (!AniListService.instance) {
      AniListService.instance = new AniListService();
    }
    return AniListService.instance;
  }

  private formatDate(date: { year: number | null; month: number | null; day: number | null }): string {
    if (!date.year) return '';
    return `${date.year}-${date.month?.toString().padStart(2, '0') || '01'}-${
      date.day?.toString().padStart(2, '0') || '01'
    }`;
  }

  private mapStatusToGlobal(status: string): IAnime['status'] {
    const statusMap: { [key: string]: IAnime['status'] } = {
      FINISHED: 'FINISHED',
      RELEASING: 'RELEASING',
      NOT_YET_RELEASED: 'NOT_YET_RELEASED',
      CANCELLED: 'CANCELLED',
    };
    return statusMap[status] || 'NOT_YET_RELEASED';
  }

  private mapToGlobalAnime(anilistAnime: IAnilistAnimeData): IAnime {
    return {
      id: anilistAnime.id.toString(),
      malId: anilistAnime.idMal,
      title: anilistAnime.title.english || anilistAnime.title.romaji,
      description: anilistAnime.description || '',
      coverImage: anilistAnime.coverImage.extraLarge || anilistAnime.coverImage.large || anilistAnime.coverImage.medium || '',
      bannerImage: anilistAnime.bannerImage || undefined,
      genres: anilistAnime.genres,
      status: this.mapStatusToGlobal(anilistAnime.status),
      episodes: anilistAnime.episodes || undefined,
      duration: anilistAnime.duration || undefined,
      rating: anilistAnime.averageScore ? anilistAnime.averageScore / 10 : undefined,
      startDate: this.formatDate(anilistAnime.startDate),
      endDate: this.formatDate(anilistAnime.endDate),
    };
  }

  private mapToSearchResult(anilistAnime: IAnilistAnimeData): IAnimeSearchResult {
    return {
      id: anilistAnime.id.toString(),
      title: anilistAnime.title.english || anilistAnime.title.romaji,
      coverImage: anilistAnime.coverImage.large,
      description: anilistAnime.description || undefined,
      genres: anilistAnime.genres,
      status: this.mapStatusToGlobal(anilistAnime.status),
      episodes: anilistAnime.episodes || undefined,
      rating: anilistAnime.averageScore ? anilistAnime.averageScore / 10 : undefined,
      format: anilistAnime.format || undefined,
      season: anilistAnime.season || undefined,
      seasonYear: anilistAnime.seasonYear || undefined,
      studios: anilistAnime.studios.edges.map(edge => ({
        name: edge.node.name,
        isMain: edge.isMain
      }))
    };
  }

  public async getSpotlight(page: number = 1, perPage: number = 20): Promise<IPaginatedResult<IAnime>> {
    const query = `
      query ($page: Int = 1, $perPage: Int = 20) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, sort: [TRENDING_DESC, SCORE_DESC], isAdult: false) {
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

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { page, perPage }
        }),
      });

      const data = (await response.json()) as IAnilistSearchResponse;
      
      return {
        items: data.data.Page.media.map(anime => this.mapToGlobalAnime(anime)),
        total: data.data.Page.pageInfo.total,
        currentPage: data.data.Page.pageInfo.currentPage,
        totalPages: data.data.Page.pageInfo.lastPage,
        hasNextPage: data.data.Page.pageInfo.hasNextPage,
        hasPreviousPage: data.data.Page.pageInfo.currentPage > 1
      };
    } catch (error) {
      console.error('Error fetching spotlight anime from AniList:', error);
      return {
        items: [],
        total: 0,
        currentPage: page,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  }

  public async getAnimeByMalId(malId: number): Promise<IAnime | null> {
    try {
      const query = `
        query ($id: Int) {
          Media(idMal: $id, type: ANIME) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            bannerImage
            genres
            status
            episodes
            duration
            averageScore
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
          }
        }
      `;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { id: malId },
        }),
      });

      const data = (await response.json()) as IAnilistResponse<IAnilistAnimeData>;
      if (!data.data.Media) return null;

      return this.mapToGlobalAnime(data.data.Media);
    } catch (error) {
      console.error('Error fetching anime from AniList:', error);
      return null;
    }
  }

  public async getAnimesByMalIds(malIds: number[]): Promise<IAnime[]> {
    if (!malIds.length) {
      return [];
    }

    const query = `
      query ($ids: [Int]) {
        Page(perPage: ${malIds.length}) {
          media(idMal_in: $ids, type: ANIME) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              extraLarge
              large
              medium
            }
            bannerImage
            genres
            status
            episodes
            duration
            averageScore
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
            studios {
              edges {
                isMain
                node {
                  name
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { ids: malIds }
        }),
      });

      const data = await response.json() as IAnilistSearchResponse;
      
      if (data.errors) {
        console.error('AniList API errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'Error fetching multiple anime');
      }

      return data.data.Page.media.map(anime => this.mapToGlobalAnime(anime));
    } catch (error) {
      console.error('Error fetching multiple anime:', error);
      return [];
    }
  }

  public async searchAnime(params: IAnimeSearchParams): Promise<IPaginatedResult<IAnimeSearchResult>> {
    if (!params.query?.trim()) {
      throw new Error("Search query cannot be empty");
    }

    // Base variables
    const variables: IAnilistSearchVariables = {
      search: params.query,
      page: params.page || 1,
      perPage: params.perPage || 20,
      type: "ANIME",
      sort: ["SEARCH_MATCH"],
      isAdult: false
    };

    // Only add non-empty parameters
    if (params.season) variables.season = params.season;
    if (params.seasonYear) variables.seasonYear = params.seasonYear;
    if (params.genres && params.genres.length > 0) variables.genres = params.genres;
    if (params.format && params.format.length > 0) variables.format = params.format;
    if (params.status) variables.status = params.status;
    if (params.sort && params.sort.length > 0) {
      variables.sort = params.sort;
    } else {
      variables.sort = ["SEARCH_MATCH", "POPULARITY_DESC"];
    }

    const query = `
      query (
        $page: Int = 1
        $perPage: Int = 20
        $search: String
        $type: MediaType
        $season: MediaSeason
        $format: [MediaFormat]
        $status: MediaStatus
        $genres: [String]
        $seasonYear: Int
        $sort: [MediaSort]
        $isAdult: Boolean = false
      ) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(
            search: $search
            type: $type
            season: $season
            format_in: $format
            status: $status
            genre_in: $genres
            seasonYear: $seasonYear
            sort: $sort
            isAdult: $isAdult
          ) {
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

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        }),
      });

      const data = (await response.json()) as IAnilistSearchResponse;
      
      if (data.errors) {
        console.error('AniList API errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'Error searching anime');
      }

      const { pageInfo, media } = data.data.Page;

      return {
        items: media.map(item => this.mapToSearchResult(item)),
        total: pageInfo.total,
        currentPage: pageInfo.currentPage,
        totalPages: pageInfo.lastPage,
        hasNextPage: pageInfo.hasNextPage,
        hasPreviousPage: pageInfo.currentPage > 1
      };
    } catch (error) {
      console.error('Error searching anime:', error);
      return {
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  }
} 