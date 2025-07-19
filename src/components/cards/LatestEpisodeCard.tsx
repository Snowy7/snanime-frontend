import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { IAnimeLatest } from "@/types/anime";
import BaseCard from "../ui/BaseCard";

type LatestEpisodeCardProps = {
  episode: IAnimeLatest;
  viewMode?: "grid" | "list";
};

const LatestEpisodeCard: React.FC<LatestEpisodeCardProps> = ({
  episode,
  viewMode = "grid",
}) => {
  const { t } = useLanguage();

  const extraInfo = [];

  // Add episode number if available
  if (episode.totalEpisodes) {
    extraInfo.push({
      label: t("episode"),
      value: `${episode.totalEpisodes} ${t("episodes")}`,
    });
  }

  return (
    <BaseCard
      href={`/anime/${episode.id}`}
      imageUrl={episode.posterUrl}
      title={episode.title}
      badges={[
        ...(episode.type
          ? [
              {
                text: t(episode.type),
                color: "bg-green-600/20 text-green-300",
              },
            ]
          : []),
        ...(episode.totalEpisodes
          ? [
              {
                text: `${t("episode")} ${episode.totalEpisodes}`,
                color: "bg-blue-600/20 text-blue-300",
              },
            ]
          : []),
      ]}
      description={episode.year.toString()}
      extraInfo={extraInfo}
      hoverEffect="scale"
      viewMode={viewMode}
      size={viewMode === "list" ? "sm" : "md"}
      className="h-full"
    />
  );
};

export default LatestEpisodeCard;
