"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Clock, Eye, Tv2Icon } from 'lucide-react';

interface WatchEpisodeCardProps {
  episode: {
    id: string;
    number: number;
    title: string;
  };
  animeTitle: string;
  animeId: string;
  posterUrl?: string;
  isActive?: boolean;
  onClick?: () => void;
  isLazyLoad?: boolean;
}

export const WatchEpisodeCard: React.FC<WatchEpisodeCardProps> = ({
  episode,
  animeTitle,
  animeId,
  posterUrl,
  isActive = false,
  onClick,
  isLazyLoad = true,
}) => {
  const [isVisible, setIsVisible] = useState(!isLazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
        rootMargin: '100px', // Start loading 100px before the element enters viewport
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

  // Placeholder for thumbnail (use anime poster as fallback)
  const thumbnailUrl = posterUrl || '/images/default-anime.png';

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="w-full hover:bg-white/10 transition-all duration-200 rounded-lg"
    >
      {isVisible ? (
        <div className="flex gap-3 p-3 rounded-full flex-col w-full">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-full h-40 rounded-lg overflow-hidden bg-neutral-800 border border-white/10">
            <Image
              src={thumbnailUrl}
              alt={`${animeTitle} Episode ${episode.number}`}
              fill
              style={{ objectFit: 'cover' }}
              className={`w-full h-full transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                } ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
              onLoad={() => setIsLoaded(true)}
              sizes="(max-width: 768px) 128px, 128px"
            />

            {/* Loading placeholder */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-800 animate-pulse flex items-center justify-center">
                <Play className="w-6 h-6 text-neutral-500" />
              </div>
            )}

            {/* Play overlay */}
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
            </div>

            {/* Episode number badge */}
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg border border-white/20">
              <div className="flex items-center gap-1">
                <Tv2Icon className="w-3 h-3" />
                <span>{episode.number}</span>
              </div>
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute top-2 left-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            )}
          </div>

          {/* Episode info */}
          <div className="flex-1 min-w-0 py-1">
            <h3 className={`text-sm font-medium line-clamp-2 transition-colors w-full ${isActive
                ? 'text-primary'
                : 'text-white/90 group-hover:text-white'
              }`}>
              {episode.title || `Episode ${episode.number}`}
            </h3>

            <p className="text-xs text-white/50 mt-1 truncate">
              {animeTitle}
            </p>
          </div>
        </div>
      ) : (
        // Skeleton loader for lazy loading
        <div className="flex gap-3 p-3 rounded-xl">
          <div className="flex-shrink-0 w-32 h-20 rounded-lg bg-neutral-800 animate-pulse border border-white/10"></div>
          <div className="flex-1 min-w-0 py-1 space-y-2">
            <div className="h-4 bg-neutral-800 rounded animate-pulse"></div>
            <div className="h-3 bg-neutral-800 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-neutral-800 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}; 