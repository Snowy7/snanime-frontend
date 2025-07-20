"use client";
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, X, ChevronLeft, Play, List, Grid3X3, Menu } from 'lucide-react';
import Link from 'next/link';
import { VideoPlayer } from '../video-player/VideoPlayer';
import { WatchEpisodeCard } from '../cards/WatchEpisodeCard';
import { IAnimeEpisodeDetails } from '@/types/anime';
import { useLanguage } from '@/context/LanguageContext';

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
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [dominantColor, setDominantColor] = useState<{ r: number; g: number; b: number }>({ r: 20, g: 20, b: 40 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRequestRef = useRef<number | undefined>(undefined);
  const colorHistoryRef = useRef<{ r: number; g: number; b: number }[]>([]);
  const lastUpdateTime = useRef<number>(0);
  const { language, t } = useLanguage();

  const currentEpisodeIndex = episodeDetails.allEpisodes.findIndex(
    (ep) => ep.id === episodeDetails.id
  );
  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = currentEpisodeIndex < episodeDetails.allEpisodes.length - 1;

  // Optimized color extraction with throttling
  const extractDominantColor = useCallback(() => {
    const extractFrame = () => {
      const now = Date.now();
      // Throttle to max 4 updates per second for better performance
      if (now - lastUpdateTime.current < 250) {
        frameRequestRef.current = requestAnimationFrame(extractFrame);
        return;
      }
      lastUpdateTime.current = now;

      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Check if video is ready and has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        frameRequestRef.current = requestAnimationFrame(extractFrame);
        return;
      }

      // Use small canvas for better performance
      canvas.width = 8;
      canvas.height = 8;

      try {
        // Check if the video allows cross-origin access for canvas operations
        if (video.crossOrigin !== 'anonymous') {
          // console.warn('Video does not have cross-origin access, skipping frame extraction');
          // Continue animation loop but skip color extraction
          frameRequestRef.current = requestAnimationFrame(extractFrame);
          return;
        }

        // Draw current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0;
        let brightPixelCount = 0;

        // Calculate average color (skip very dark pixels)
        for (let i = 0; i < imageData.length; i += 4) {
          const pixelR = imageData[i];
          const pixelG = imageData[i + 1];
          const pixelB = imageData[i + 2];
          const brightness = (pixelR + pixelG + pixelB) / 3;
          
          // Only count pixels that aren't too dark
          if (brightness > 40) {
            r += pixelR;
            g += pixelG;
            b += pixelB;
            brightPixelCount++;
          }
        }

        if (brightPixelCount > 0) {
          r = Math.round(r / brightPixelCount);
          g = Math.round(g / brightPixelCount);
          b = Math.round(b / brightPixelCount);

          // Add to history for smoothing
          colorHistoryRef.current.push({ r, g, b });
          if (colorHistoryRef.current.length > 3) {
            colorHistoryRef.current.shift();
          }

          // Average the history for smoother transitions
          const avgColor = colorHistoryRef.current.reduce(
            (acc, color) => ({
              r: acc.r + color.r,
              g: acc.g + color.g,
              b: acc.b + color.b,
            }),
            { r: 0, g: 0, b: 0 }
          );

          const historyLength = colorHistoryRef.current.length;
          const newColor = {
            r: Math.round(avgColor.r / historyLength),
            g: Math.round(avgColor.g / historyLength),
            b: Math.round(avgColor.b / historyLength),
          };

          // Only update if color changed significantly to reduce re-renders
          const colorDiff = Math.abs(newColor.r - dominantColor.r) + 
                           Math.abs(newColor.g - dominantColor.g) + 
                           Math.abs(newColor.b - dominantColor.b);
          
          if (colorDiff > 50) {
            setDominantColor(newColor);
          }
        }
      } catch (error) {
        // Handle CORS and other canvas errors gracefully
        console.warn('Color extraction error:', error);
        
        // If it's a CORS error, we can't extract colors from this video
        if (error instanceof DOMException && error.message.includes('insecure')) {
          console.warn('CORS policy prevents color extraction from this video source');
          // Stop trying to extract colors for this video
          return;
        }
      }

      // Continue animation loop
      frameRequestRef.current = requestAnimationFrame(extractFrame);
    };

    extractFrame();
  }, [dominantColor]);

  // Setup video ref callback
  const handleVideoRef = useCallback((videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      videoRef.current = videoElement;
      // Start color extraction when video starts playing
      videoElement.addEventListener('playing', () => {
        extractDominantColor();
      });
      videoElement.addEventListener('pause', () => {
        if (frameRequestRef.current) {
          cancelAnimationFrame(frameRequestRef.current);
        }
      });
    }
  }, [extractDominantColor]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
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
      const previousEpisode = episodeDetails.allEpisodes[currentEpisodeIndex - 1];
      onEpisodeChange(previousEpisode.number);
    }
  }, [hasPrevious, onEpisodeChange, episodeDetails.allEpisodes, currentEpisodeIndex]);

  const handleNext = useCallback(() => {
    if (hasNext && onEpisodeChange) {
      const nextEpisode = episodeDetails.allEpisodes[currentEpisodeIndex + 1];
      onEpisodeChange(nextEpisode.number);
    }
  }, [hasNext, onEpisodeChange, episodeDetails.allEpisodes, currentEpisodeIndex]);

  const handleEpisodeClick = useCallback((episodeNumber: number) => {
    if (onEpisodeChange) {
      onEpisodeChange(episodeNumber);
    }
  }, [onEpisodeChange]);

  // Memoize color string to prevent unnecessary re-renders
  const colorString = useMemo(() => 
    `${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}`, 
    [dominantColor]
  );

  return (
    <div className="min-h-screen relative" dir="ltr">
      {/* Atmospheric background with video color effects */}
      <div className="fixed inset-0 -z-10">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        
        {/* Main atmospheric gradient from video color */}
        <div 
          className="absolute inset-0 opacity-25 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(ellipse 80% 60% at center 40%, rgb(${colorString}) 0%, transparent 70%)`
          }}
        />
        
        {/* Additional subtle atmospheric layers */}
        <div 
          className="absolute inset-0 opacity-10 blur-2xl transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle at 25% 50%, rgb(${colorString}) 0%, transparent 50%),
                        radial-gradient(circle at 75% 50%, rgb(${colorString}) 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Hidden canvas for color extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8 xl:gap-12">
            {/* Left Side - Video Player Area */}
            <div className="lg:col-span-1">
              {/* Video Player */}
              <div className="mb-8">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black/50 backdrop-blur-sm border-white/10">
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

              {/* Video Info - YouTube Style */}
              <div className="mb-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {/* Back Button */}
                <div className="mb-4">
                  <Link 
                    href={`/anime/${episodeDetails.animeId}`}
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t('backTo')} {episodeDetails.animeTitle}</span>
                  </Link>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      #{episodeDetails.number}: {episodeDetails.title}
                    </h1>
                    
                    <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                      <span>{t('episode')} {episodeDetails.number} {t('of')} {episodeDetails.allEpisodes.length}</span>
                      {episodeDetails.isFiller && (
                        <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium">
                          {t('filler')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Navigation Controls - Moved to top right */}
                  <div className="flex items-center gap-2 ml-4" dir={'ltr'}>
                    <button
                      onClick={handlePrevious}
                      disabled={!hasPrevious}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        hasPrevious
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-white/5 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden md:inline">{t('previous')}</span>
                    </button>
                    
                    <button
                      onClick={handleNext}
                      disabled={!hasNext}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        hasNext
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-white/5 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      <span className="hidden md:inline">{t('next')}</span>
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {episodeDetails.description && (
                  <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="text-white/80 text-sm leading-relaxed">
                      {episodeDetails.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Future expansion area - Comments, recommendations, etc. */}
              <div className="space-y-6">
                {/* Placeholder for future features */}
                <div className="bg-black/5 backdrop-blur-lg border border-white/5 rounded-2xl p-6">
                  <div className="text-center py-8">
                    <div className="text-white/40 text-sm">
                      {t('moreFeaturesComingSoon')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Episodes Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 max-h-[calc(100vh-14rem)] bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {/* Desktop Episodes Content */}
                <div className="h-full flex flex-col">
              {/* Episodes Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <List className="w-5 h-5" />
                    {t('episodes')}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60 bg-white/10 px-3 py-1.5 rounded-full font-medium">
                      {episodeDetails.allEpisodes.length}
                    </span>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="lg:hidden p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <div className={`flex items-center transition-all duration-200 ${
                    showSearch ? 'bg-white/15' : 'bg-white/10 hover:bg-white/15'
                  } rounded-xl border border-white/20 focus-within:border-white/40`}>
                    <Search className="w-4 h-4 text-white/40 ml-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowSearch(true)}
                      onBlur={() => setShowSearch(false)}
                      placeholder="Search episodes..."
                      className="w-full bg-transparent text-white placeholder-white/40 px-4 py-3 focus:outline-none text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10 mr-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Episodes List */}
              <div className="flex-1 overflow-y-auto scrollbar-hide max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-20rem)]">
                <div className="p-4">
                  {filteredEpisodes.length > 0 ? (
                    <div className="space-y-3">
                      {filteredEpisodes.map((episode, index) => (
                        <WatchEpisodeCard
                          key={episode.id}
                          episode={episode}
                          animeTitle={episodeDetails.animeTitle}
                          animeId={episodeDetails.animeId}
                          posterUrl={posterUrl}
                          isActive={episode.number === episodeDetails.number}
                          onClick={() => handleEpisodeClick(episode.number)}
                          isLazyLoad={index > 10} // Only lazy load after first 10 episodes
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/40 mb-2">No episodes found matching "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
                              </div>
                </div>
              </div>
            </div>

            {/* Mobile Episodes Sidebar */}
            <div className={`${
              showSidebar ? 'translate-x-0' : 'translate-x-full'
            } lg:hidden fixed z-40 top-0 right-0 bottom-0 w-full sm:w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 transition-transform duration-300 ease-in-out`}>
              {/* Mobile Episodes Content */}
              <div className="h-full flex flex-col">
                {/* Episodes Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <List className="w-5 h-5" />
                      {t('episodes')}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/60 bg-white/10 px-3 py-1.5 rounded-full font-medium">
                        {episodeDetails.allEpisodes.length}
                      </span>
                      <button
                        onClick={() => setShowSidebar(false)}
                        className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <div className={`flex items-center transition-all duration-200 ${
                      showSearch ? 'bg-white/15' : 'bg-white/10 hover:bg-white/15'
                    } rounded-xl border border-white/20 focus-within:border-white/40`}>
                      <Search className="w-4 h-4 text-white/40 ml-4" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSearch(true)}
                        onBlur={() => setShowSearch(false)}
                        placeholder="Search episodes..."
                        className="w-full bg-transparent text-white placeholder-white/40 px-4 py-3 focus:outline-none text-sm"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10 mr-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Episodes List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <div className="p-4">
                    {filteredEpisodes.length > 0 ? (
                      <div className="space-y-3">
                        {filteredEpisodes.map((episode, index) => (
                          <WatchEpisodeCard
                            key={episode.id}
                            episode={episode}
                            animeTitle={episodeDetails.animeTitle}
                            animeId={episodeDetails.animeId}
                            posterUrl={posterUrl}
                            isActive={episode.number === episodeDetails.number}
                            onClick={() => handleEpisodeClick(episode.number)}
                            isLazyLoad={index > 10}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 mb-2">No episodes found matching "{searchQuery}"</p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-red-400 hover:text-red-300 text-sm transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Overlay */}
            {showSidebar && (
              <div 
                className="lg:hidden fixed inset-0 bg-black/50 z-30"
                onClick={() => setShowSidebar(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Episodes Menu Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}; 