import React from "react";
import AnimeCard from "./cards/AnimeCard";
import SectionTitle from "./SectionTitle";
import LatestEpisodeCard from "./cards/LatestEpisodeCard";
import { IAnimeSearchResult } from "@/types/anime";

interface GridSectionProps {
  title: string;
  shows: IAnimeSearchResult[];
  onViewAllClick?: () => void;
  className?: string;
}

const LatestEpisodes: React.FC<GridSectionProps> = ({ title, shows, onViewAllClick, className = "" }) => {
  if (!shows || shows.length === 0) {
    return null; // Don't render if no shows
  }

  return (
    <section className={`py-8 md:py-12 px-4 md:px-8 ${className}`}>
      <SectionTitle title={title} onViewAllClick={onViewAllClick} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {shows.map((show) => (
          <LatestEpisodeCard key={show.id} episode={show} />
        ))}
      </div>
    </section>
  );
};

export default LatestEpisodes;
