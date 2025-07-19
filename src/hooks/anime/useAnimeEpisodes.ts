import { snanimeService } from '@/services/global';
import { useLanguage } from '@/context/LanguageContext';

export const useAnimeEpisodes = () => {
  const { language } = useLanguage();

  const fetchLatestEpisodes = async (params?: any) => {
    const response = await snanimeService.getLatestAnime(params, language);
    return response;
  };

  const fetchEpisodeDetails = async (id: string, episodeNumber: string) => {
    // Convert episode number to numeric if it's a string
    const numericEpisodeNumber = parseInt(episodeNumber, 10);
    if (isNaN(numericEpisodeNumber)) {
      throw new Error(`Invalid episode number: ${episodeNumber}`);
    }

    const response = await snanimeService.getEpisodeDetails(id, numericEpisodeNumber.toString(), language);
    return response;
  };

  return {
    fetchLatestEpisodes,
    fetchEpisodeDetails,
  };
}; 