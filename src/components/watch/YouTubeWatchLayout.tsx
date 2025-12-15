"use client";
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, X, ChevronLeft, Play, List, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VideoPlayer } from '../video-player/VideoPlayer';
import { WatchEpisodeCard } from '../cards/WatchEpisodeCard';
import { IAnimeEpisodeDetails } from '@/types/anime';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '../ui/button';

interface YouTubeWatchLayoutProps {
  episodeDetails: IAnimeEpisodeDetails;
  onEpisodeChange?: (number: number) => void;
  posterUrl?: string;
}

export const YouTubeWatchLayout: React.FC<YouTubeWatchLayoutProps> = ({
  episodeDetails,
  onEpisodeChange,
  posterUrl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { language, t } = useLanguage();

  const currentEpisodeIndex = episodeDetails.allEpisodes.findIndex(
    (ep) => ep.id === episodeDetails.id
  );
  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = currentEpisodeIndex < episodeDetails.allEpisodes.length - 1;

  const previousEpisode = hasPrevious ? episodeDetails.allEpisodes[currentEpisodeIndex - 1] : null;
  const nextEpisode = hasNext ? episodeDetails.allEpisodes[currentEpisodeIndex + 1] : null;

  // Setup video ref callback
  const handleVideoRef = useCallback((videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      videoRef.current = videoElement;
    }
  }, []);

  // Filter episodes based on search query
  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return episodeDetails.allEpisodes;

    const query = searchQuery.toLowerCase();
    return episodeDetails.allEpisodes.filter(
      (episode) =>
        episode.number.toString().includes(query) ||
        episode.title.toLowerCase().includes(query)
    );
  }, [episodeDetails.allEpisodes, searchQuery]);

  const handlePrevious = useCallback(() => {
    if (hasPrevious && onEpisodeChange) {
      const previousEp = episodeDetails.allEpisodes[currentEpisodeIndex - 1];
      onEpisodeChange(previousEp.number);
    }
  }, [hasPrevious, onEpisodeChange, episodeDetails.allEpisodes, currentEpisodeIndex]);

  const handleNext = useCallback(() => {
    if (hasNext && onEpisodeChange) {
      const nextEp = episodeDetails.allEpisodes[currentEpisodeIndex + 1];
      onEpisodeChange(nextEp.number);
    }
  }, [hasNext, onEpisodeChange, episodeDetails.allEpisodes, currentEpisodeIndex]);

  const handleEpisodeClick = useCallback((episodeNumber: number) => {
    if (onEpisodeChange) {
      onEpisodeChange(episodeNumber);
    }
  }, [onEpisodeChange]);

  return (
    <div className="min-h-screen bg-background font-sans container mx-auto" dir="ltr">
      <div className="pt-24 pb-12">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-10">

          {/* Back Link */}
          <Link
            href={`/anime/${episodeDetails.animeId}`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-6"
          >
            <div className="p-1 rounded-full bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>To the anime page</span>
          </Link>

          {/* Video Player */}
          <div className="mb-10">
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/5 relative z-10">
              <VideoPlayer
                streams={episodeDetails.streams}
                poster={posterUrl}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onVideoRef={handleVideoRef}
              />
            </div>
          </div>

          {/* Info & Navigation Section */}
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-end mb-16">

            {/* Left: Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                  {episodeDetails.animeTitle}
                </h1>
                <h2 className="text-xl lg:text-2xl font-medium text-white/80">
                  Episode {episodeDetails.number} <span className="mx-2 text-white/30">•</span> {episodeDetails.title}
                </h2>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{"Unknown Date"}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <span>HD</span>
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <span>TV Series</span>
              </div>

              {episodeDetails.description && (
                <p className="text-white/60 text-base leading-relaxed max-w-3xl line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                  {episodeDetails.description}
                </p>
              )}
            </div>

            {/* Right: Navigation Cards (Side-by-Side) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/30 mb-1">
                <span>Navigation</span>
                <span>{currentEpisodeIndex + 1} / {episodeDetails.allEpisodes.length}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Previous Button */}
                <button
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className={`group relative h-24 rounded-xl overflow-hidden border border-white/10 text-left transition-all ${hasPrevious ? 'hover:border-white/30 hover:shadow-lg' : 'opacity-30 cursor-not-allowed'
                    }`}
                >
                  <div className="absolute inset-0 bg-neutral-900">
                    {previousEpisode && (
                      <Image
                        src={posterUrl || ''}
                        alt="Prev"
                        fill
                        className="object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                  </div>

                  <div className="absolute inset-0 p-4 flex flex-col justify-center">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">Previous</span>
                    <span className="text-sm text-white font-bold truncate">
                      Episode {previousEpisode ? previousEpisode.number : currentEpisodeIndex}
                    </span>
                  </div>

                  {hasPrevious && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <ChevronLeft className="w-5 h-5 text-white/60" />
                    </div>
                  )}
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className={`group relative h-24 rounded-xl overflow-hidden border border-white/10 text-right transition-all ${hasNext ? 'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5' : 'opacity-30 cursor-not-allowed'
                    }`}
                >
                  <div className="absolute inset-0 bg-neutral-900">
                    {nextEpisode && (
                      <Image
                        src={posterUrl || ''}
                        alt="Next"
                        fill
                        className="object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/60 to-transparent" />
                  </div>

                  <div className="absolute inset-0 p-4 flex flex-col justify-center items-end">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Up Next</span>
                    <span className="text-sm text-white font-bold truncate w-full">
                      Episode {nextEpisode ? nextEpisode.number : currentEpisodeIndex + 2}
                    </span>
                  </div>

                  {hasNext && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">
                      <Play className="w-4 h-4 fill-current text-primary" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* All Episodes Section */}
          <div className="border-t border-white/5 pt-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">All Episodes</h3>
                <p className="text-white/40 text-sm">
                  Season 1 • {episodeDetails.allEpisodes.length} Episodes
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search episode number..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:bg-white/[0.06] focus:border-white/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Episodes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredEpisodes.length > 0 ? (
                filteredEpisodes.map((episode, index) => (
                  <WatchEpisodeCard
                    key={episode.id}
                    episode={episode}
                    animeTitle={episodeDetails.animeTitle}
                    animeId={episodeDetails.animeId}
                    posterUrl={posterUrl}
                    isActive={episode.number === episodeDetails.number}
                    onClick={() => handleEpisodeClick(episode.number)}
                    isLazyLoad={index > 18}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-white/30" />
                  </div>
                  <p className="text-white/40">No episodes found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
