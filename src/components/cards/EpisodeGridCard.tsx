"use client";
import React from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface EpisodeGridCardProps {
  episode: {
    id: string;
    number: number;
    title?: string;
  };
  posterUrl?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function EpisodeGridCard({
  episode,
  posterUrl,
  isActive = false,
  onClick,
  className,
}: EpisodeGridCardProps) {
  const title = episode.title || `Episode ${episode.number}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group text-left w-full",
        "rounded-2xl overflow-hidden border transition-colors",
        isActive
          ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/10"
          : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-neutral-900">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-800" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
              isActive ? "bg-primary text-primary-foreground" : "bg-black/50 text-white/80"
            )}
          >
            EP {episode.number}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/20">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-3">
        <p className={cn("text-sm font-semibold leading-snug line-clamp-2", isActive ? "text-primary" : "text-white/90")}>
          {title}
        </p>
      </div>
    </button>
  );
}


