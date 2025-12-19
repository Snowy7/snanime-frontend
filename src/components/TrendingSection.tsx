"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronRight } from "lucide-react";
import { IAnimeSpotlight } from "@/types/anime";

interface TrendingSectionProps {
  title: string;
  animes: IAnimeSpotlight[];
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ title, animes }) => {
  if (!animes || animes.length === 0) return null;

  return (
    <section className="py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white/90 italic">{title}</h2>
        <Link 
          href="/trending" 
          className="flex items-center gap-1 px-4 py-2 rounded-full border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors"
        >
          See All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {animes.map((anime, index) => (
          <TrendingCard key={`${anime.id}-${index}`} anime={anime} />
        ))}
      </div>
    </section>
  );
};

function TrendingCard({ anime }: { anime: IAnimeSpotlight }) {
  // IAnimeSpotlight doesn't have status or averageScore, use rank for rating display
  const rating = anime.rank ? (10 - anime.rank * 0.1).toFixed(1) : "4.7";

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group relative block aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900"
    >
      {/* Poster */}
      <Image
        src={anime.posterUrl}
        alt={anime.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

      {/* Top Badges */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
        {/* Status Badge */}
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white bg-emerald-600">
          Ongoing
        </span>
        
        {/* Rating Badge */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-[11px] font-bold text-white">{rating}</span>
        </div>
      </div>

      {/* Bottom: Title */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {anime.title}
        </h3>
      </div>
    </Link>
  );
}

export default TrendingSection;

