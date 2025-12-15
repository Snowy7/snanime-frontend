"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export interface AnimeCardProps {
  id: string;
  title: string;
  posterUrl: string | null;
  type?: string;
  rating?: number | null;
  status?: string;
  year?: number | string;
  episodes?: number | string;
  seasons?: number | string;
  genres?: string[];
  rank?: number;
  className?: string;
}

const AnimeCard: React.FC<AnimeCardProps> = ({
  id,
  title,
  posterUrl,
  type,
  rating,
  status,
  year,
  episodes,
  seasons,
  genres,
  rank,
  className,
}) => {
  const { t } = useLanguage();

  // Get first genre for badge display
  const primaryGenre = genres?.[0] || type;

  // Status badge styling
  const isOngoing = status?.toLowerCase() === "ongoing" || status?.toLowerCase() === "releasing";

  return (
    <Link
      href={`/anime/${id}`}
      className={cn(
        "group relative block w-full aspect-[2/3] rounded-2xl overflow-hidden bg-neutral-900 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02]",
        className
      )}
    >
      {/* Poster Image */}
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-600 text-sm">
          No Image
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 z-10 pointer-events-none" />

      {/* Hover Overlay with Actions */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300 delay-75">
          <Bookmark className="w-4 h-4" />
        </div>
      </div>

      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start z-30">
        {/* Status Badge (ONGOING) */}
        {isOngoing && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white bg-emerald-600 shadow-sm">
            Ongoing
          </span>
        )}
        
        {/* Genre/Type Badge */}
        {primaryGenre && !isOngoing && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-primary-foreground bg-primary/90 backdrop-blur-sm shadow-sm">
            {primaryGenre}
          </span>
        )}

        {/* Rating Badge */}
        {rating && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/90 backdrop-blur-sm shadow-sm ml-auto">
            <Star className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
            <span className="text-xs font-bold text-primary-foreground">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
          </div>
        )}
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-30">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-3 mb-1.5">
          {title}
        </h3>
        
        {/* Metadata */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/60 font-medium">
          {seasons && <span>{seasons} {Number(seasons) === 1 ? 'season' : 'seasons'}</span>}
          {seasons && episodes && <span>•</span>}
          {episodes && <span>{episodes} {Number(episodes) === 1 ? 'episode' : 'episodes'}</span>}
          {!seasons && !episodes && year && <span>{year}</span>}
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
