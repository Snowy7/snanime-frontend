import React from "react";
import AnimeCard from "@/components/cards/AnimeCard";
import { IAnimeSearchResult } from "@/types/anime";

interface SearchResultCardProps {
  anime: IAnimeSearchResult;
  viewMode?: "grid" | "list";
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ anime, viewMode }) => {
  if (viewMode === "list") {
    // Fallback/Different layout for list view if needed later, 
    // for now we can just use the card or a simple row.
    // Given the design request focused on grids, we'll keep it simple or TODO a list row.
    return <AnimeCard 
      id={anime.id} 
      title={anime.title} 
      posterUrl={anime.coverImage}
      type={anime.format}
      rating={anime.rating ? anime.rating / 10 : undefined} // Convert 1-100 to 1-10 if needed, or keep as is
      status={anime.status}
      episodes={anime.episodes}
      year={anime.seasonYear}
    />;
  }

  return (
    <AnimeCard 
      id={anime.id} 
      title={anime.title} 
      posterUrl={anime.coverImage}
      type={anime.format}
      rating={anime.rating ? Number((anime.rating / 10).toFixed(1)) : undefined}
      status={anime.status}
      episodes={anime.episodes}
      year={anime.seasonYear}
    />
  );
};

export default SearchResultCard;
