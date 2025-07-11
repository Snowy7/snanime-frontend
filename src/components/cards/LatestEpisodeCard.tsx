import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { IAnimeSearchResult } from "@/types/anime";
import BaseCard from "../ui/BaseCard";

type LatestEpisodeCardProps = {
  episode: IAnimeSearchResult;
  episodeNumber?: number;
  viewMode?: "grid" | "list";
};

const LatestEpisodeCard: React.FC<LatestEpisodeCardProps> = ({ 
  episode, 
  episodeNumber,
  viewMode = "grid" 
}) => {
  const { t } = useLanguage();

  const extraInfo = [];
  
  // Add episode number if available
  if (episodeNumber) {
    extraInfo.push({ 
      label: t("episode"), 
      value: episodeNumber.toString() 
    });
  }

  // Add format info
  if (episode.format) {
    extraInfo.push({ 
      label: "Format", 
      value: t(episode.format)
    });
  }

  // Add main studio
  const mainStudio = episode.studios?.find(studio => studio.isMain);
  if (mainStudio) {
    extraInfo.push({ 
      label: "Studio", 
      value: mainStudio.name 
    });
  }

  return (
    <BaseCard
      href={`/anime/${episode.id}`}
      imageUrl={episode.coverImage}
      title={episode.title}
      badges={[
        ...(episode.status ? [{ 
          text: t(episode.status), 
          color: "bg-green-600/20 text-green-300" 
        }] : []),
        ...(episodeNumber ? [{ 
          text: `${t("episode")} ${episodeNumber}`, 
          color: "bg-blue-600/20 text-blue-300" 
        }] : [])
      ]}
      rating={episode.rating}
      description={episode.description}
      tags={episode.genres}
      extraInfo={extraInfo}
      hoverEffect="scale"
      viewMode={viewMode}
      size={viewMode === "list" ? "sm" : "md"}
      className="h-full"
    />
  );
};

export default LatestEpisodeCard;
