import { IAnime, IAnimeEpisode, IAnimeEpisodeDetails, IPaginatedResult, IAnimeSearchResult } from '@/types/anime';
import {
  ISnAnimeData,
  ISnAnimeEpisode,
  ISnAnimeEpisodeDetails,
  ISnAnimePaginatedResult,
  ISnAnimeSearchResult,
  ISnAnimeSpotlight,
  ISnAnimeRecentlyUpdated,
} from './types';

export class SnAnimeService {
  private static instance: SnAnimeService;
  private baseUrl = process.env.NEXT_PUBLIC_SNANIME_API_URL || 'https://snanime-api.snowydev.xyz/api/v1/anime';

  private constructor() {}

  public static getInstance(): SnAnimeService {
    if (!SnAnimeService.instance) {
      SnAnimeService.instance = new SnAnimeService();
    }
    return SnAnimeService.instance;
  }

  private mapStatusToGlobal(status: string): IAnime['status'] {
    const statusMap: { [key: string]: IAnime['status'] } = {
      completed: 'FINISHED',
      ongoing: 'RELEASING',
      upcoming: 'NOT_YET_RELEASED',
      dropped: 'CANCELLED',
    };
    return statusMap[status.toLowerCase()] || 'NOT_YET_RELEASED';
  }

  private mapToGlobalAnime(snAnime: ISnAnimeData): IAnime {
    return {
      id: snAnime.id,
      malId: snAnime.malId,
      title: snAnime.title,
      description: snAnime.description,
      coverImage: snAnime.image,
      bannerImage: snAnime.cover,
      genres: snAnime.genres,
      status: this.mapStatusToGlobal(snAnime.status),
      episodes: snAnime.totalEpisodes,
      duration: snAnime.duration ? parseInt(snAnime.duration) : undefined,
      rating: snAnime.rating,
      startDate: snAnime.releaseDate,
      endDate: snAnime.endDate,
    };
  }

  private mapToGlobalEpisode(snEpisode: ISnAnimeEpisode): IAnimeEpisode {
    return {
      id: snEpisode.id,
      number: snEpisode.episodeNumber,
      title: snEpisode.title,
      thumbnail: snEpisode.image,
      duration: snEpisode.duration ? parseInt(snEpisode.duration) : undefined,
    };
  }

  private mapToGlobalEpisodeDetails(snEpisode: ISnAnimeEpisodeDetails): IAnimeEpisodeDetails {
    return {
      ...this.mapToGlobalEpisode(snEpisode),
      streams: {
        sources: snEpisode.streams.sources.map(source => ({
          url: source.url,
          quality: source.url.includes('720p') ? '720p' : source.url.includes('1080p') ? '1080p' : '480p',
          isM3U8: source.url.endsWith('.m3u8'),
        })),
        subtitles: snEpisode.streams.subtitles?.map(sub => ({
          url: sub.url,
          lang: sub.language,
        })),
      },
    };
  }

  private mapToGlobalSearchResult(snResult: ISnAnimeSearchResult | ISnAnimeSpotlight | ISnAnimeRecentlyUpdated): IAnimeSearchResult {
    return {
      id: snResult.id,
      title: snResult.title,
      coverImage: snResult.image,
    };
  }

  private mapToPaginatedResult<T, U>(
    snResult: ISnAnimePaginatedResult<T>,
    mapper: (item: T) => U
  ): IPaginatedResult<U> {
    return {
      items: snResult.results.map(mapper),
      total: snResult.results.length,
      currentPage: snResult.currentPage,
      totalPages: snResult.totalPages,
      hasNextPage: snResult.hasNextPage,
      hasPreviousPage: snResult.currentPage > 1,
    };
  }

  public async getAnimeInfo(id: string): Promise<IAnime | null> {
    try {
      // Implementation here - replace with actual API call
      const response = await fetch(`${this.baseUrl}/anime/${id}`);
      const data = await response.json() as ISnAnimeData;
      return this.mapToGlobalAnime(data);
    } catch (error) {
      console.error('Error fetching anime info:', error);
      return null;
    }
  }

  public async getSpotlight(lang: string): Promise<IPaginatedResult<IAnimeSearchResult>> {
    try {
      // Implementation here - replace with actual API call
      const response = await fetch(`${this.baseUrl}/spotlight?lang=${lang}`);
      const data = await response.json() as ISnAnimePaginatedResult<ISnAnimeSpotlight>;
      return this.mapToPaginatedResult(data, item => this.mapToGlobalSearchResult(item));
    } catch (error) {
      console.error('Error fetching spotlight:', error);
      return {
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  public async searchAnime(
    query: string,
    lang: string
  ): Promise<IPaginatedResult<IAnimeSearchResult>> {
    try {
      // Implementation here - replace with actual API call
      const response = await fetch(`${this.baseUrl}/search?q=${query}&lang=${lang}`);
      const data = await response.json() as ISnAnimePaginatedResult<ISnAnimeSearchResult>;
      return this.mapToPaginatedResult(data, item => this.mapToGlobalSearchResult(item));
    } catch (error) {
      console.error('Error searching anime:', error);
      return {
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  public async getLatestEpisodes(
    lang: string
  ): Promise<IPaginatedResult<IAnimeSearchResult>> {
    try {
      // Implementation here - replace with actual API call
      const response = await fetch(`${this.baseUrl}/latest-episodes?lang=${lang}`);
      const data = await response.json() as ISnAnimePaginatedResult<ISnAnimeRecentlyUpdated>;
      return this.mapToPaginatedResult(data, item => this.mapToGlobalSearchResult(item));
    } catch (error) {
      console.error('Error fetching latest episodes:', error);
      return {
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  public async getAnimeEpisode(
    id: string,
    episodeNumber: number,
    lang: string
  ): Promise<IAnimeEpisodeDetails | null> {
    try {
      // Implementation here - replace with actual API call
      const response = await fetch(`${this.baseUrl}/anime/${id}/episode/${episodeNumber}?lang=${lang}`);
      const data = await response.json() as ISnAnimeEpisodeDetails;
      return this.mapToGlobalEpisodeDetails(data);
    } catch (error) {
      console.error('Error fetching anime episode:', error);
      return null;
    }
  }
} 