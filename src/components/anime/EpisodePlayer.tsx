"use client";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Play, Eye, Search, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "../video-player/VideoPlayer";
import { IAnimeEpisodeDetails } from "@/types/anime";

interface EpisodePlayerProps {
  episodeDetails: IAnimeEpisodeDetails;
  onEpisodeChange?: (number: number) => void;
}

const EpisodePlayer: React.FC<EpisodePlayerProps> = ({ episodeDetails, onEpisodeChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dominantColor, setDominantColor] = useState<{ r: number; g: number; b: number }>({ r: 20, g: 20, b: 40 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRequestRef = useRef<number | undefined>(undefined);
  const colorHistoryRef = useRef<{ r: number; g: number; b: number }[]>([]);
  const lastUpdateTime = useRef<number>(0);

  const currentEpisodeIndex = episodeDetails.allEpisodes.findIndex((ep) => ep.id === episodeDetails.id);
  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = currentEpisodeIndex < episodeDetails.allEpisodes.length - 1;

  // Optimized color extraction with throttling
  const extractDominantColor = useCallback(() => {
    const now = Date.now();
    // Throttle to max 2 updates per second for better performance
    if (now - lastUpdateTime.current < 500) {
      frameRequestRef.current = requestAnimationFrame(extractDominantColor);
      return;
    }
    lastUpdateTime.current = now;

    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use even smaller canvas for better performance
    canvas.width = 8;
    canvas.height = 8;

    try {
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

        // Add to history for smoothing (reduced history size)
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
        
        if (colorDiff > 30) {
          setDominantColor(newColor);
        }
      }
    } catch (error) {
      // Silently handle any canvas errors
      console.warn('Color extraction error:', error);
    }

    // Continue animation loop
    frameRequestRef.current = requestAnimationFrame(extractDominantColor);
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

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery) return episodeDetails.allEpisodes;
    const query = searchQuery.toLowerCase();
    return episodeDetails.allEpisodes.filter(
      (episode) =>
        episode.number.toString().includes(query) ||
        episode.title.toLowerCase().includes(query)
    );
  }, [episodeDetails.allEpisodes, searchQuery]);

  // Memoize color string to prevent unnecessary re-renders
  const colorString = useMemo(() => 
    `${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}`, 
    [dominantColor]
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Optimized atmospheric background */}
      <div className="fixed inset-0 -z-10">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        
        {/* Subtle radial gradient from video color - reduced opacity */}
        <div 
          className="absolute inset-0 opacity-25 transition-all duration-2000"
          style={{
            background: `radial-gradient(ellipse 80% 60% at center 40%, rgb(${colorString}) 0%, transparent 70%)`
          }}
        />
        
        {/* Additional subtle atmospheric layer */}
        <div 
          className="absolute inset-0 opacity-10 blur-2xl transition-all duration-2000"
          style={{
            background: `radial-gradient(circle at 25% 50%, rgb(${colorString}) 0%, transparent 50%),
                        radial-gradient(circle at 75% 50%, rgb(${colorString}) 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Hidden canvas for color extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main content container */}
      <div className="relative z-10 pt-20 pb-32">
        {/* Header - Fixed at bottom with better visibility */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-xl">
          <div className="bg-black/30 border-t border-white/10">
            <div className="flex items-center justify-between max-w-7xl mx-auto p-4">
              <Link 
                href={`/anime/${episodeDetails.animeId}`} 
                className="flex items-center gap-2 text-white/80 hover:text-white transition-all group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline font-medium">Back to {episodeDetails.animeTitle}</span>
                <span className="sm:hidden font-medium">Back</span>
              </Link>

              <div className="text-center flex-1 px-4">
                <h1 className="text-lg font-bold text-white truncate drop-shadow-lg">
                  Episode {episodeDetails.number}: {episodeDetails.title}
                </h1>
                <p className="text-sm text-white/60 truncate">{episodeDetails.animeTitle}</p>
              </div>

              <div className="text-right text-sm text-white/60 hidden sm:block font-medium">
                {episodeDetails.number} / {episodeDetails.allEpisodes.length}
              </div>
            </div>
          </div>
        </div>

        {/* Video Player - smaller and centered with proper spacing */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Enhanced glow effect around video */}
          <div 
            className="absolute -inset-3 opacity-30 blur-xl -z-10 transition-all duration-2000 rounded-xl"
            style={{
              background: `radial-gradient(ellipse at center, rgb(${colorString}) 0%, transparent 70%)`
            }}
          />
          
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <VideoPlayer 
              streams={episodeDetails.streams} 
              poster={""} 
              onNext={handleNext} 
              onPrevious={handlePrevious} 
              hasNext={hasNext} 
              hasPrevious={hasPrevious}
              onVideoRef={handleVideoRef}
            />
          </div>
        </div>

        {/* Episode Info with glassmorphism */}
        <div className="relative mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        Episode {episodeDetails.number}: {episodeDetails.title}
                        <Sparkles className="w-5 h-5 text-yellow-400 opacity-60" />
                      </h2>
                      {episodeDetails.description && (
                        <p className="text-white/70 leading-relaxed mt-3">
                          {episodeDetails.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-white/60">
                        <Play className="w-4 h-4" />
                        <span>Episode {episodeDetails.number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <Eye className="w-4 h-4" />
                        <span>{episodeDetails.allEpisodes.length} Episodes</span>
                      </div>
                      {episodeDetails.isFiller && (
                        <div className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                          Filler
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Navigation</h3>
                      <div className="space-y-2">
                        <button
                          onClick={handlePrevious}
                          disabled={!hasPrevious}
                          className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                            hasPrevious
                              ? "text-white/70 hover:bg-white/10 hover:text-white"
                              : "text-white/30 cursor-not-allowed"
                          }`}
                        >
                          {hasPrevious
                            ? `← Episode ${episodeDetails.allEpisodes[currentEpisodeIndex - 1]?.number}`
                            : "← No previous episode"}
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={!hasNext}
                          className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                            hasNext
                              ? "text-white/70 hover:bg-white/10 hover:text-white"
                              : "text-white/30 cursor-not-allowed"
                          }`}
                        >
                          {hasNext
                            ? `Episode ${episodeDetails.allEpisodes[currentEpisodeIndex + 1]?.number} →`
                            : "No next episode →"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episode List with improved styling */}
        <div className="relative mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span>All Episodes</span>
                    <span className="text-sm text-white/40 font-normal bg-white/10 px-3 py-1 rounded-full">
                      {episodeDetails.allEpisodes.length} total
                    </span>
                  </h3>
                  
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search episodes..."
                      className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                      {searchQuery ? (
                        <X 
                          className="w-5 h-5 cursor-pointer hover:text-white transition-colors" 
                          onClick={() => setSearchQuery("")}
                        />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {filteredEpisodes.map((episode) => (
                    <button
                      key={episode.number}
                      onClick={() => onEpisodeChange?.(episode.number)}
                      className={`group relative p-4 rounded-xl transition-all duration-200 text-left border ${
                        episode.number === episodeDetails.number
                          ? "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 text-white shadow-lg shadow-primary/10"
                          : "bg-white/5 backdrop-blur border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-lg"
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">{episode.number}</div>
                      <div
                        className="text-xs opacity-70 leading-tight overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                        }}
                      >
                        {episode.title}
                      </div>
                      {episode.number === episodeDetails.number && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* No Results Message */}
                {filteredEpisodes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-white/40">No episodes found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodePlayer;
