import React from "react";
import BaseCard from "@/components/ui/BaseCard";
import { IAnimeSearchResult } from "@/types/anime";

interface SearchResultCardProps {
  anime: IAnimeSearchResult;
  viewMode?: "grid" | "list";
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ anime, viewMode = "grid" }) => {
  const extraInfo = [];
  
  // Add format info (TV, Movie, etc.)
  if (anime.format) {
    extraInfo.push({ label: "Format", value: anime.format });
  }

  // Add episode count
  if (anime.episodes) {
    extraInfo.push({ label: "Episodes", value: anime.episodes.toString() });
  }

  // Add season info
  if (anime.season && anime.seasonYear) {
    extraInfo.push({ 
      label: "Season", 
      value: `${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} ${anime.seasonYear}` 
    });
  }

  // Add main studio
  const mainStudio = anime.studios?.find(studio => studio.isMain);
  if (mainStudio) {
    extraInfo.push({ label: "Studio", value: mainStudio.name });
  }

  console.log(anime);

  return (
    <BaseCard
      href={`/anime/${anime.id}`}
      imageUrl={anime.coverImage}
      title={anime.title}
      badges={[
        ...(anime.status ? [{ text: anime.status, color: "bg-green-600/20 text-green-300" }] : [])
      ]}
      rating={anime.rating || undefined}
      description={anime.description}
      tags={anime.genres}
      extraInfo={extraInfo}
      hoverEffect="scale"
      viewMode={viewMode}
      size={viewMode === "list" ? "sm" : "md"}
    />
  );
};

export default SearchResultCard; 