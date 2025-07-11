import { useLoading } from '../useLoading';
import { anilistService } from '@/services/global';
import { IPaginatedResult, IAnime } from '@/types/anime';

export const useTopAnimes = () => {
  const { isLoading, incrementLoading, decrementLoading } = useLoading(0);

  const getTopAnimes = async (): Promise<IPaginatedResult<IAnime>> => {
    incrementLoading();
    try {
      const response = await anilistService.getSpotlight(1, 10);
      return response;
    } catch (error) {
      console.error("Error fetching top animes:", error);
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

  return { getTopAnimes, isLoading };
}; 