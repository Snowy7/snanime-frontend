"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Clock, Check, Tv2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchEpisodeCardProps {
  episode: {
    id: string;
    number: number;
    title: string;
    thumbnail?: string;
  };
  animeTitle: string;
  animeId: string;
  posterUrl?: string;
  isActive?: boolean;
  onClick?: () => void;
  isLazyLoad?: boolean;
  watchProgress?: {
    progress: number;
    duration?: number | null;
    completed: boolean;
  } | null;
}

export const WatchEpisodeCard: React.FC<WatchEpisodeCardProps> = ({
  episode,
  animeTitle,
  animeId,
  posterUrl,
  isActive = false,
  onClick,
  isLazyLoad = true,
  watchProgress,
}) => {
  const [isVisible, setIsVisible] = useState(!isLazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isWatched = watchProgress?.completed;
  const isInProgress = watchProgress && !watchProgress.completed && watchProgress.progress > 0;
  const progressPercent = watchProgress?.duration && watchProgress.duration > 0 
    ? Math.min((watchProgress.progress / watchProgress.duration) * 100, 100)
    : 0;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!isLazyLoad || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [isLazyLoad, isVisible]);

  const thumbnailUrl = episode.thumbnail || posterUrl || '/images/default-anime.png';

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "w-full transition-all duration-200 rounded-lg cursor-pointer",
        isActive ? "bg-white/10" : "hover:bg-white/5"
      )}
    >
      {isVisible ? (
        <div className="flex gap-3 p-3 flex-col w-full">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-full h-40 rounded-lg overflow-hidden bg-neutral-800 border border-white/10">
            <Image
              src={thumbnailUrl}
              alt={`${animeTitle} Episode ${episode.number}`}
              fill
              style={{ objectFit: 'cover' }}
              className={cn(
                "w-full h-full transition-all duration-300",
                isLoaded ? 'opacity-100' : 'opacity-0',
                isActive ? 'scale-105' : 'group-hover:scale-105',
                isWatched && !isActive && 'opacity-60'
              )}
              onLoad={() => setIsLoaded(true)}
              sizes="(max-width: 768px) 128px, 128px"
            />

            {/* Loading placeholder */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-800 animate-pulse flex items-center justify-center">
                <Play className="w-6 h-6 text-neutral-500" />
              </div>
            )}

            {/* Watched overlay */}
            {isWatched && !isActive && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-green-500/90 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
            )}

            {/* Play overlay for active */}
            {isActive && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-10 h-10 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary-foreground/30">
                  <Play className="w-4 h-4 text-primary-foreground ml-0.5 fill-primary-foreground" />
                </div>
              </div>
            )}

            {/* Progress bar for partially watched */}
            {isInProgress && progressPercent > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Continue watching badge */}
            {isInProgress && !isActive && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary/90 backdrop-blur-sm flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary-foreground" />
                <span className="text-[10px] text-primary-foreground font-medium">Continue</span>
              </div>
            )}

            {/* Watched badge */}
            {isWatched && !isActive && (
              <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-green-500/90 backdrop-blur-sm flex items-center gap-1">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Episode number badge */}
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg border border-white/20">
              <div className="flex items-center gap-1">
                <Tv2Icon className="w-3 h-3" />
                <span>{episode.number}</span>
              </div>
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary flex items-center gap-1">
                <span className="text-[10px] text-white font-medium">Now Playing</span>
              </div>
            )}
          </div>

          {/* Episode info */}
          <div className="flex-1 min-w-0 py-1">
            <h3 className={cn(
              "text-sm font-medium line-clamp-2 transition-colors w-full",
              isActive ? 'text-primary' : isWatched ? 'text-white/50' : 'text-white/90 group-hover:text-white'
            )}>
              {episode.title || `Episode ${episode.number}`}
            </h3>

            <p className={cn(
              "text-xs mt-1 truncate",
              isWatched ? "text-white/30" : "text-white/50"
            )}>
              {animeTitle}
            </p>
          </div>
        </div>
      ) : (
        // Skeleton loader for lazy loading
        <div className="flex gap-3 p-3 flex-col w-full">
          <div className="flex-shrink-0 w-full h-40 rounded-lg bg-neutral-800 animate-pulse border border-white/10" />
          <div className="flex-1 min-w-0 py-1 space-y-2">
            <div className="h-4 bg-neutral-800 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-neutral-800 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};
