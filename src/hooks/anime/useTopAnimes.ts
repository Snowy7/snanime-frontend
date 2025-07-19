import { snanimeService } from '@/services/global';
import { useLanguage } from '@/context/LanguageContext';

export const useTopAnimes = () => {
  const { language } = useLanguage();

  const fetchSpotlightAnime = async () => {
    const response = await snanimeService.getSpotlightAnime(language);
    return response;
  };

  return {
    fetchSpotlightAnime,
  };
}; 