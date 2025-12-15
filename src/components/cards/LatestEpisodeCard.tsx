import React from "react";
import AnimeCard from "@/components/cards/AnimeCard";
import { IAnimeLatest } from "@/types/anime";

type LatestEpisodeCardProps = {
  episode: IAnimeLatest;
  viewMode?: "grid" | "list";
};

const LatestEpisodeCard: React.FC<LatestEpisodeCardProps> = ({
  episode,
}) => {
  return (
    <AnimeCard 
      id={episode.id}
      title={episode.title}
      posterUrl={episode.posterUrl}
      type={episode.type}
      episodes={episode.totalEpisodes}
      status="Latest" // Or use "Ongoing" if available, but for latest episodes section usually implies ongoing/new
      year={episode.year}
    />
  );
};

export default LatestEpisodeCard;
