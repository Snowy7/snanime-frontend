"use client";
import LatestEpisodes from "@/components/LatestEpisodes";
import HeroHeader from "@/components/HeroHeader";
import TrendingSection from "@/components/TrendingSection";
import { useLanguage } from "@/context/LanguageContext";
import { IPaginatedResult, IAnimeLatest, IAnimeSpotlight } from "@/types/anime";

interface HomeClientProps {
  tops: IAnimeSpotlight[];
  latest: IPaginatedResult<IAnimeLatest>;
}

export default function HomeClient({ tops, latest }: HomeClientProps) {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen w-full text-white bg-background">
      <HeroHeader tops={tops} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trending Now Section */}
        <TrendingSection 
          title="Trending Now" 
          animes={tops.slice(0, 6)} 
        />
        
        {/* Latest Episodes Section */}
        <LatestEpisodes
          title={t("recent_episodes") || "Latest Episodes"}
          shows={latest?.items}
        />
      </div>
    </main>
  );
}
