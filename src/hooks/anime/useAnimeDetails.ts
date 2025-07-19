import { snanimeService, anilistService } from '@/services/global';
import { useLanguage } from '@/context/LanguageContext';

export const useAnimeDetails = () => {
  const { language } = useLanguage();

  const fetchAnimeDetails = async (id: string) => {
    const response = await snanimeService.getAnimeInfo(id, language);
    return response;
  };

  const fetchAnilistDetails = async (malId: number) => {
    const response = await anilistService.getAnimeByMalId(malId);
    return response;
  };

  return {
    fetchAnimeDetails,
    fetchAnilistDetails,
  };
}; 