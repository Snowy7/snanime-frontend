"use client";
import LatestEpisodes from "@/components/LatestEpisodes";
import HeroHeader from "@/components/HeroHeader";
import { useAnime } from "@/context/AnimeContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { isLoading, getTopAnimes, getLatestEpisodes } = useAnime();
  const [tops, setTops] = useState<Anime[]>([]);
  const [latest, setLatest] = useState<LatestEpisode[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTopAnimes = async () => {
      try {
        setFetchError(null);
        const topAnimes = await getTopAnimes();
        setTops(topAnimes);
      } catch (error) {
        console.error("Failed to fetch top animes:", error);
        setFetchError("Failed to load top anime. Please try again later.");
      }
    };

    const fetchLatestEpisodes = async () => {
      try {
        setFetchError(null);
        const latestEpisodes = await getLatestEpisodes();
        console.log("Latest Episodes:", latestEpisodes);
        setLatest(latestEpisodes);
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
        shows={latest}
        onViewAllClick={() => {}}
        className="max-w-screen-2xl mx-auto" // Optional: constrain width
      />
    </main>
  );
}
