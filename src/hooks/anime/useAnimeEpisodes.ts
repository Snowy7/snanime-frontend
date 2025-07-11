import { useLoading } from '../useLoading';
import { snanimeService } from '@/services/global';
import { IPaginatedResult, IAnimeSearchResult, IAnimeEpisode, IAnimeEpisodeDetails } from '@/types/anime';

export const useAnimeEpisodes = () => {
  const { isLoading, incrementLoading, decrementLoading } = useLoading(0);

  const getLatestEpisodes = async (): Promise<IPaginatedResult<IAnimeSearchResult>> => {
    incrementLoading();
    try {
      const response = await snanimeService.getLatestEpisodes("en");
      return response;
    } catch (error) {
      console.error("Error fetching latest episodes:", error);
      return {
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    } finally {
      decrementLoading();
    }
  };

  const getAnimeEpisodes = async (
    id: string,
    page: number,
    perPage: number
  ): Promise<IPaginatedResult<IAnimeEpisode>> => {
    incrementLoading();
    try {
      const response = await snanimeService.getAnimeEpisodes(id, page, perPage);
      return response;
    } catch (error) {
      console.error("Error fetching anime episodes:", error);
      return {
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    } finally {
      decrementLoading();
    }
  };

  const getAnimeEpisode = async (
    id: string,
    episodeNumber: string
  ): Promise<IAnimeEpisodeDetails | null> => {
    incrementLoading();
    try {
      const numericEpisodeNumber = typeof episodeNumber === "string" ? parseInt(episodeNumber, 10) : episodeNumber;
      if (isNaN(numericEpisodeNumber)) {
        console.warn("getAnimeEpisode called with invalid episodeNumber:", episodeNumber);
        return null;
      }
      const response = await snanimeService.getAnimeEpisode(id, numericEpisodeNumber, "en");
      return response;
    } catch (error) {
      console.error("Error fetching episode details:", error);
      return null;
    } finally {
      decrementLoading();
    }
  };

  return { getLatestEpisodes, getAnimeEpisodes, getAnimeEpisode, isLoading };
}; 