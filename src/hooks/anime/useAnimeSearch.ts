import { useState } from "react";
import { AniListService } from "@/services/anilist/service";
import { IAnimeSearchParams, IPaginatedResult, IAnimeSearchResult } from "@/types/anime";

export const useAnimeSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const anilistService = AniListService.getInstance();

  const searchAnimes = async (params: IAnimeSearchParams): Promise<IPaginatedResult<IAnimeSearchResult>> => {
    try {
      setIsLoading(true);
      return await anilistService.searchAnime(params);
    } catch (error) {
      console.error("Error searching animes:", error);
      return {
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchAnimes,
    isLoading
  };
}; 