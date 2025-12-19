import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Clock } from "lucide-react";
import { IAnimeLatest } from "@/types/anime";
import { cn } from "@/lib/utils";

type LatestEpisodeCardProps = {
  episode: IAnimeLatest;
  viewMode?: "grid" | "list";
};

const LatestEpisodeCard: React.FC<LatestEpisodeCardProps> = ({
  episode,
}) => {
  // Link to the latest episode if available, otherwise just to the anime page
  const href = episode.latestEpisode 
    ? `/anime/${episode.id}/watch/${episode.latestEpisode}`
    : `/anime/${episode.id}`;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 mb-2">
        {/* Poster Image */}
        <Image
          src={episode.posterUrl || '/images/default-anime.png'}
          alt={episode.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-1" />
          </div>
        </div>

        {/* Episode Badge */}
        {episode.latestEpisode && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary backdrop-blur-sm flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary-foreground" />
            <span className="text-xs text-primary-foreground font-semibold">EP {episode.latestEpisode}</span>
          </div>
        )}

        {/* Type Badge */}
        {episode.type && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
            <span className="text-[10px] text-white/80 font-medium uppercase">{episode.type}</span>
          </div>
        )}

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-bold text-white line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {episode.title}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            {episode.year && (
              <>
                <span>{episode.year}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
              </>
            )}
            {(episode.latestEpisode || episode.totalEpisodes) && (
              <span>{episode.latestEpisode || episode.totalEpisodes} eps</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LatestEpisodeCard;
