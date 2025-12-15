"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SnAnimeRelated } from "@/types/anime";
import { cn } from "@/lib/utils";

interface RelatedAnimeProps {
  relatedAnime: SnAnimeRelated[];
  className?: string;
}

const RelatedAnime: React.FC<RelatedAnimeProps> = ({ relatedAnime, className = "" }) => {
  const { t } = useLanguage();

  if (!relatedAnime || relatedAnime.length === 0) {
    return null;
  }

  // Filter out related anime without valid data
  const validRelated = relatedAnime.filter(anime => anime.id && anime.title);

  if (validRelated.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-6 md:py-8", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-white">
          {t("related_anime") || "Related Anime"}
        </h2>
        {validRelated.length > 6 && (
          <button className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
            <span>{t("view_all") || "View All"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
        {validRelated.slice(0, 8).map((anime, index) => (
          <Link
            key={`${anime.id}-${index}`}
            href={`/anime/${anime.id}`}
            className="group block"
          >
            {/* Poster */}
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 mb-2">
              {anime.posterUrl ? (
                <Image
                  src={anime.posterUrl}
                  alt={anime.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 12.5vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-600 text-xs">
                  No Image
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                </div>
              </div>

              {/* Relation Type Badge */}
              {anime.relationType && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white/90 font-medium uppercase tracking-wide">
                  {anime.relationType}
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xs font-medium text-white/90 line-clamp-2 group-hover:text-white transition-colors leading-tight">
              {anime.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedAnime;
