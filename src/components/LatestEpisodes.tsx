import React from "react";
import SectionTitle from "./SectionTitle";
import LatestEpisodeCard from "./cards/LatestEpisodeCard";
import { IAnimeLatest } from "@/types/anime";

interface GridSectionProps {
  title: string;
  shows: IAnimeLatest[];
  onViewAllClick?: () => void;
  className?: string;
}

const LatestEpisodes: React.FC<GridSectionProps> = ({ title, shows, onViewAllClick, className = "" }) => {
  if (!shows || shows.length === 0) {
    return null;
  }

  return (
    <section className={`py-10 ${className}`}>
      <SectionTitle title={title} onViewAllClick={onViewAllClick} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {shows.map((show) => (
          <LatestEpisodeCard key={show.id} episode={show} />
        ))}
      </div>
    </section>
  );
};

export default LatestEpisodes;
