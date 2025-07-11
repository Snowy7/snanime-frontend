"use client";
import LatestEpisodes from "@/components/LatestEpisodes";
import HeroHeader from "@/components/HeroHeader";
import { useAnime } from "@/context/AnimeContext";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { IAnime, IAnimeSearchResult, IPaginatedResult } from "@/types/anime";

export default function HomeClient() {
  const { isLoading, getTopAnimes, getLatestEpisodes } = useAnime();
  const [tops, setTops] = useState<IPaginatedResult<IAnime>>({items: [], total: 0, currentPage: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false} as IPaginatedResult<IAnime>);
  const [latest, setLatest] = useState<IPaginatedResult<IAnime>>({items: [], total: 0, currentPage: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false} as IPaginatedResult<IAnime>);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTopAnimes = async () => {
      try {
        setFetchError(null);
        const topAnimes = await getTopAnimes();
        setTops(topAnimes as IPaginatedResult<IAnime>);
      } catch (error) {
        console.error("Failed to fetch top animes:", error);
        setFetchError("Failed to load top anime. Please try again later.");
      }
    };

    const fetchLatestEpisodes = async () => {
      try {
        setFetchError(null);
        const latestEpisodes = await getLatestEpisodes();
        setLatest(latestEpisodes as IPaginatedResult<IAnime>);
      } catch (error) {
        console.error("Failed to fetch latest episodes:", error);
        setFetchError("Failed to load latest episodes. Please try again later.");
      }
    };

    fetchTopAnimes();
    fetchLatestEpisodes();
  }, []);

  return (
    <main className="h-full w-full text-white">
      <HeroHeader tops={tops} />
      <LatestEpisodes
        title={t("recent_episodes")}
        shows={latest?.items}
        onViewAllClick={() => {}}
        className="max-w-screen-2xl mx-auto"
      />
    </main>
  );
} 