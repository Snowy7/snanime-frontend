import { useLoading } from '../useLoading';
import { snanimeService, anilistService } from '@/services/global';
import { IAnime } from '@/types/anime';

export const useAnimeDetails = () => {
  const { isLoading, incrementLoading, decrementLoading } = useLoading(0);

  const getAnimeById = async (id: string): Promise<IAnime | null> => {
    incrementLoading();
    try {
      const response = await snanimeService.getAnimeInfo(id);
      return response;
    } catch (error) {
      console.error("Error fetching anime details:", error);
      return null;
    } finally {
      decrementLoading();
    }
  };

  const getAnilistAnimeById = async (id: string): Promise<IAnime | null> => {
    incrementLoading();
    try {
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      if (isNaN(numericId)) {
        console.warn("getAnilistAnimeById called with invalid id:", id);
        return null;
      }
      const response = await anilistService.getAnimeByMalId(numericId);
      return response;
    } catch (error) {
      console.error("Error fetching Anilist anime details:", error);
      return null;
    } finally {
      decrementLoading();
    }
  };

  return { getAnimeById, getAnilistAnimeById, isLoading };
}; 