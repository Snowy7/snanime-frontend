"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronDown, Check, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { userService, WatchHistoryItem } from "@/services/user";
import { IAnimeEpisode } from "@/types/anime";
import { cn } from "@/lib/utils";

interface EpisodeListProps {
  episodes: IAnimeEpisode[];
  animeTitle: string;
  animeId: string;
  malId?: number;
  animeDescription?: string;
  animePoster?: string;
}

const EPISODES_PER_PAGE = 20;

const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  animeTitle,
  animeId,
  malId,
  animeDescription,
  animePoster,
}) => {
  const { t } = useLanguage();
  const { isAuthenticated, getAccessToken } = useAuth();
  const [watchHistory, setWatchHistory] = useState<Map<number, WatchHistoryItem>>(new Map());

  // Extract malId from animeId if not provided
  const effectiveMalId = malId || parseInt(animeId.includes(':') ? animeId.split(':')[1] : animeId);

  // Fetch watch history for this anime
  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (!isAuthenticated || !effectiveMalId) return;

      try {
        const token = await getAccessToken();
        if (!token) return;

        // Get all watch history and filter by malId
        const history = await userService.getWatchHistory(token, { limit: 500 });
        const animeHistory = history.filter(h => h.malId === effectiveMalId);
        
        const historyMap = new Map<number, WatchHistoryItem>();
        animeHistory.forEach(h => {
          historyMap.set(h.episodeNumber, h);
        });
        
        setWatchHistory(historyMap);
      } catch (error) {
        console.error("[EpisodeList] Failed to fetch watch history:", error);
      }
    };

    fetchWatchHistory();
  }, [isAuthenticated, effectiveMalId, getAccessToken]);

  // Calculate episode ranges (1-20, 21-40, etc.)
  const episodeRanges = useMemo(() => {
    const ranges: { start: number; end: number; label: string }[] = [];
    const totalEpisodes = episodes.length;
    
    for (let i = 0; i < totalEpisodes; i += EPISODES_PER_PAGE) {
      const start = i + 1;
      const end = Math.min(i + EPISODES_PER_PAGE, totalEpisodes);
      ranges.push({
        start: i,
        end: i + EPISODES_PER_PAGE,
        label: `${start} - ${end}`
      });
    }
    
    return ranges;
  }, [episodes.length]);

  const [activeRange, setActiveRange] = useState(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);

  // Get episodes for the current range
  const currentEpisodes = useMemo(() => {
    const range = episodeRanges[activeRange];
    if (!range) return episodes.slice(0, EPISODES_PER_PAGE);
    
    const sliced = episodes.slice(range.start, range.end);
    
    if (sortOrder === "desc") {
      return [...sliced].reverse();
    }
    return sliced;
  }, [episodes, activeRange, episodeRanges, sortOrder]);

  const currentRangeLabel = episodeRanges[activeRange]?.label || "1 - 20";

  // Get watch progress for an episode
  const getEpisodeProgress = (episodeNumber: number) => {
    return watchHistory.get(episodeNumber);
  };

  return (
    <section id="episodes-section" className="py-8 md:py-10">
      {/* Header with Episode Range Dropdown and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Left Side - Title and Range Dropdown */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-xl font-bold text-white">
            {t("episodes") || "Episodes"}
          </h2>
          
          {/* Episode Range Dropdown - only show if more than one page */}
          {episodeRanges.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors border border-white/10"
              >
                <span>{currentRangeLabel}</span>
                <ChevronDown className={cn("w-4 h-4 text-white/60 transition-transform", isRangeDropdownOpen && "rotate-180")} />
              </button>
              
              {/* Dropdown Menu */}
              {isRangeDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsRangeDropdownOpen(false)} 
                  />
                  <div className="absolute top-full left-0 mt-2 py-1 bg-neutral-900 border border-white/10 rounded-lg shadow-xl z-50 min-w-[120px] max-h-[300px] overflow-y-auto">
                    {episodeRanges.map((range, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setActiveRange(index);
                          setIsRangeDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-sm text-left transition-colors",
                          activeRange === index 
                            ? "bg-white/10 text-white" 
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white/80 text-sm font-medium hover:bg-white/15 transition-colors border border-white/10"
          >
            <span className="text-white/60">{t("sort_by") || "Sort by"}:</span>
            <span className="text-white">{sortOrder === "asc" ? (t("oldest") || "Oldest") : (t("newest") || "Newest")}</span>
            <ChevronDown className="w-4 h-4 text-white/50" />
          </button>
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {currentEpisodes.map((episode) => {
          const progress = getEpisodeProgress(episode.number);
          const isWatched = progress?.completed;
          const isInProgress = progress && !progress.completed && progress.progress > 0;
          const progressPercent = progress?.duration && progress.duration > 0 
            ? Math.min((progress.progress / progress.duration) * 100, 100)
            : 0;

          return (
            <Link
              key={episode.id}
              href={`/anime/${animeId}/watch/${episode.number}`}
              className="group block"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800 mb-2">
                {(episode.thumbnail || animePoster) ? (
                  <Image
                    src={episode.thumbnail || animePoster!}
                    alt={`Episode ${episode.number}`}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-300 group-hover:scale-105",
                      isWatched && "opacity-60"
                    )}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                    <Play className="w-8 h-8 text-white/20" />
                  </div>
                )}
                
                {/* Watched Overlay */}
                {isWatched && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-green-500/90 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                {/* Play Button Overlay - show on hover if not watched */}
                {!isWatched && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Progress Bar for partially watched */}
                {isInProgress && progressPercent > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}

                {/* Currently Watching Badge */}
                {isInProgress && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary/90 backdrop-blur-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary-foreground" />
                    <span className="text-[10px] text-primary-foreground font-medium">Continue</span>
                  </div>
                )}

                {/* Watched Badge */}
                {isWatched && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-green-500/90 backdrop-blur-sm flex items-center gap-1">
                    <Check className="w-3 h-3 text-white" />
                    <span className="text-[10px] text-white font-medium">Watched</span>
                  </div>
                )}

                {/* Duration Badge */}
                {episode.duration && !isWatched && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white/90 font-medium">
                    {episode.duration}
                  </div>
                )}
              </div>

              {/* Episode Info */}
              <div className="space-y-0.5">
                <h3 className={cn(
                  "text-sm font-semibold transition-colors",
                  isWatched ? "text-white/50" : "text-white group-hover:text-white/80"
                )}>
                  {t("episode") || "Episode"} {episode.number}
                </h3>
                {episode.title && (
                  <p className={cn(
                    "text-xs line-clamp-1",
                    isWatched ? "text-white/30" : "text-white/50"
                  )}>
                    {episode.title}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default EpisodeList;
