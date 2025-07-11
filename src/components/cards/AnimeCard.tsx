import React from "react";
import BaseCard from "@/components/ui/BaseCard";

interface AnimeCardProps {
  show: SnAnimeData | SnAnimeRelated | SnAnimeRecommendations;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ show }) => {
  const extraInfo = [];
  if ('totalEpisodes' in show) {
    extraInfo.push({ label: "Episodes", value: show.totalEpisodes || "?" });
  }
  if ('duration' in show) {
    extraInfo.push({ label: "Duration", value: show.duration || "?" });
  }

  const rating = 'rating' in show && typeof show.rating === 'number' ? show.rating : undefined;

  return (
    <BaseCard
      href={`/anime/${show.id}`}
      imageUrl={show.image}
      title={show.title}
      badges={[{ text: show.type }]}
      rating={rating}
      year={'year' in show ? show.year : undefined}
      status={'status' in show ? show.status : undefined}
      tags={'genres' in show ? show.genres : undefined}
      extraInfo={extraInfo}
      description={'description' in show ? show.description : undefined}
      hoverEffect="scale"
    />
  );
};

export default AnimeCard;
