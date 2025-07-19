"use client";
import LatestEpisodes from "@/components/LatestEpisodes";
import HeroHeader from "@/components/HeroHeader";
import { useLanguage } from "@/context/LanguageContext";
import { IPaginatedResult, IAnimeLatest, IAnimeSpotlight } from "@/types/anime";

interface HomeClientProps {
  tops: IAnimeSpotlight[];
  latest: IPaginatedResult<IAnimeLatest>;
}

export default function HomeClient({ tops, latest }: HomeClientProps) {
  const { t } = useLanguage();

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