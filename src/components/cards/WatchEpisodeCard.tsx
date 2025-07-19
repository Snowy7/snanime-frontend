"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Clock, Eye } from 'lucide-react';

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
      className={`group cursor-pointer transition-all duration-200 rounded-xl border ${
        isActive 
          ? 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/10' 
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
      onClick={onClick}
    >
      {isVisible ? (
        <div className="flex gap-3 p-3 rounded-xl">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-neutral-800 border border-white/10">
            <Image
              src={thumbnailUrl}
              alt={`${animeTitle} Episode ${episode.number}`}
              fill
              style={{ objectFit: 'cover' }}
              className={`w-full h-full transition-all duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
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
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 flex items-center justify-center ${
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
            </div>

            {/* Episode number badge */}
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg border border-white/20">
              {episode.number}
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>

          {/* Episode info */}
          <div className="flex-1 min-w-0 py-1">
            <h3 className={`text-sm font-medium line-clamp-2 transition-colors ${
              isActive 
                ? 'text-red-400' 
                : 'text-white/90 group-hover:text-white'
            }`}>
              {episode.title || `Episode ${episode.number}`}
            </h3>
            
            <p className="text-xs text-white/50 mt-1 truncate">
              {animeTitle}
            </p>

            {/* Episode stats */}
            <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Episode {episode.number}</span>
              </div>
              {/* Add duration if available */}
              {/* <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>24:30</span>
              </div> */}
            </div>
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