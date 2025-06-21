import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Play } from "lucide-react";

interface SearchCardProps {
  anime: Anime;
  viewMode?: "grid" | "list";
}

const SearchCard: React.FC<SearchCardProps> = ({ anime, viewMode = "grid" }) => {
  if (viewMode === "list") {
    return (
      <div className="flex items-center space-x-4 p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-neutral-800 hover:border-neutral-600 hover:bg-black/40 transition-all duration-300 group">
        <div className="flex-shrink-0 w-20 h-28 relative overflow-hidden rounded-lg">
          <Image
            src={anime.posterUrl}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <Link href={`/anime/${anime.id}`} className="block">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate mb-2">
              {anime.title}
            </h3>
            
            <div className="flex items-center space-x-4 mb-2 text-sm">
              <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs font-medium">
                {anime.type}
              </span>
              
              <span className="flex items-center text-neutral-400">
                <Calendar className="w-4 h-4 mr-1" />
                {anime.year}
              </span>
              
              <span className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 mr-1 fill-current" />
                {anime.rating}
              </span>
              
              <span className="text-neutral-500">
                {anime.status}
              </span>
            </div>
            
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {anime.genres.slice(0, 3).map((genre) => (
                  <span 
                    key={genre} 
                    className="px-2 py-0.5 bg-neutral-800/50 text-neutral-300 rounded text-xs"
                  >
                    {genre}
                  </span>
                ))}
                {anime.genres.length > 3 && (
                  <span className="px-2 py-0.5 bg-neutral-800/50 text-neutral-400 rounded text-xs">
                    +{anime.genres.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            {anime.description && (
              <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                {anime.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-neutral-500">
                {anime.sub}
              </span>
              {anime.episodesCount && (
                <span className="text-xs text-neutral-500">
                  {anime.episodesCount} episodes
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Link 
      href={`/anime/${anime.id}`} 
      className="group block overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-black/20 backdrop-blur-sm border border-neutral-800 hover:border-neutral-600 hover:scale-105"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <Image 
          src={anime.posterUrl} 
          alt={anime.title} 
          fill 
          style={{ objectFit: "cover" }} 
          className="transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
        
        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs text-white font-medium">{anime.rating}</span>
        </div>
        
        {/* Type badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600/80 backdrop-blur-sm rounded-full">
          <span className="text-xs text-white font-medium">{anime.type}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm md:text-base font-semibold text-white truncate group-hover:text-blue-400 transition-colors mb-2">
          {anime.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
          <span>{anime.year}</span>
          <span>{anime.status}</span>
        </div>
        
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {anime.genres.slice(0, 2).map((genre) => (
              <span 
                key={genre} 
                className="px-1.5 py-0.5 bg-neutral-800/50 text-neutral-400 rounded text-xs"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">{anime.sub}</span>
          {anime.episodesCount && (
            <span className="text-neutral-500">{anime.episodesCount} eps</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SearchCard;
