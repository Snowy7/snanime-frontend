import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IAnimeSearchResult } from "@/types/anime";

interface SearchCardProps {
  anime: IAnimeSearchResult;
  viewMode: "grid" | "list";
}

export default function SearchCard({ anime, viewMode }: SearchCardProps) {
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="group relative bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all duration-200">
        {/* Thumbnail */}
        <div className="relative aspect-[3/4]">
          <Image
            src={anime.coverImage}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-neutral-200 line-clamp-1 group-hover:text-white transition-colors">
            {anime.title}
          </h3>
          {anime.description && (
            <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
              {anime.description}
            </p>
          )}
          
          {/* Meta Info */}
          <div className="mt-3 flex items-center gap-3 text-sm">
            {anime.rating && (
              <div className="text-yellow-500">★ {(anime.rating).toFixed(1)}</div>
            )}
            {anime.episodes && (
              <div className="text-neutral-400">{anime.episodes} Episodes</div>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {anime.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 text-xs font-medium bg-neutral-800/50 text-neutral-300 rounded-md"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
