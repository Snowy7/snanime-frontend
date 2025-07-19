import React from "react";
import BaseCard from "@/components/ui/BaseCard";
import { SnAnimeRelated } from "@/types/anime";

interface AnimeCardProps {
  show: SnAnimeRelated;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ show }) => {
  const extraInfo: { label: string; value: string | number | undefined }[] = [];
  if ('totalEpisodes' in show && typeof show.totalEpisodes === 'number') {
    extraInfo.push({ label: "Episodes", value: show.totalEpisodes });
  }
  if ('duration' in show && typeof show.duration === 'number') {
    extraInfo.push({ label: "Duration", value: show.duration });
  }

  const rating = 'rating' in show && typeof show.rating === 'number' ? show.rating : undefined;

  return (
    <BaseCard
      href={`/anime/${show.id}`}
      imageUrl={show.posterUrl || null}
      title={show.title}
      badges={[{ text: show.type }]}
      rating={rating}
      year={'year' in show ? parseInt(show.year || "0") : undefined}
      status={'status' in show ? show.status : undefined}
      tags={'genres' in show ? show.genres : undefined}
      extraInfo={extraInfo}
      hoverEffect="scale"
    />
  );
};

export default AnimeCard;
