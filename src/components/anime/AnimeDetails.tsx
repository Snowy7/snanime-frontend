"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Play, Heart, Star, Check, ChevronDown, Plus, Eye, Pause, X, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { userService, WatchlistItem, WatchStatus } from "@/services/user";
import { IAnime } from "@/types/anime";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Status options with labels and icons
const STATUS_OPTIONS: { value: WatchStatus; label: string; icon: React.ReactNode }[] = [
  { value: "WATCHING", label: "Watching", icon: <Eye className="w-4 h-4" /> },
  { value: "COMPLETED", label: "Completed", icon: <Check className="w-4 h-4" /> },
  { value: "ON_HOLD", label: "On Hold", icon: <Pause className="w-4 h-4" /> },
  { value: "DROPPED", label: "Dropped", icon: <X className="w-4 h-4" /> },
  { value: "PLAN_TO_WATCH", label: "Plan to Watch", icon: <Clock className="w-4 h-4" /> },
];

interface AnimeDetailsProps {
  anime: IAnime;
}

const AnimeDetails: React.FC<AnimeDetailsProps> = ({ anime }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchlistItem, setWatchlistItem] = useState<WatchlistItem | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { user, isAuthenticated, getAccessToken } = useAuth();
  const router = useRouter();

  const malId = anime.malId || parseInt(anime.id.replace(/^\d+:/, '')) || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusDropdown]);

  // Check if anime is in watchlist/favorites when component mounts
  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated || !malId) return;
      
      try {
        const token = await getAccessToken();
        if (!token) return;

        // Check watchlist and favorites in parallel
        const [watchlistResult, favoriteResult] = await Promise.all([
          userService.getWatchlistItem(token, malId).catch(() => null),
          userService.isFavorite(token, malId).catch(() => false),
        ]);

        setWatchlistItem(watchlistResult);
        setIsInWatchlist(!!watchlistResult);
        setIsFavorite(favoriteResult);
      } catch (error) {
        console.error("Error checking anime status:", error);
      }
    };

    checkStatus();
  }, [isAuthenticated, malId, getAccessToken]);

  const handleWatchNow = () => {
    const episodeSection = document.getElementById("episodes-section");
    if (episodeSection) {
      episodeSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddToWatchlist = useCallback(async (status: WatchStatus = "PLAN_TO_WATCH") => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!malId) {
      console.error("No MAL ID available for this anime");
      return;
    }

    try {
      setIsSaving(true);
      const token = await getAccessToken();
      
      if (!token) {
        router.push("/login");
        return;
      }

      console.log("[Watchlist] Adding to watchlist with status:", status);
      const item = await userService.addToWatchlist(token, malId, { status });
      setIsInWatchlist(true);
      setWatchlistItem(item);
      setShowStatusDropdown(false);
    } catch (error: any) {
      console.error("[Watchlist] Failed to update watchlist:", error?.message || error);
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, malId, getAccessToken, router]);

  const handleStatusChange = useCallback(async (status: WatchStatus) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!malId) {
      console.error("No MAL ID available for this anime");
      return;
    }

    try {
      setIsSaving(true);
      const token = await getAccessToken();
      
      if (!token) {
        router.push("/login");
        return;
      }

      if (isInWatchlist) {
        console.log("[Watchlist] Updating status to:", status);
        const item = await userService.updateWatchlistItem(token, malId, { status });
        setWatchlistItem(item);
      } else {
        console.log("[Watchlist] Adding with status:", status);
        const item = await userService.addToWatchlist(token, malId, { status });
        setIsInWatchlist(true);
        setWatchlistItem(item);
      }
      setShowStatusDropdown(false);
    } catch (error: any) {
      console.error("[Watchlist] Failed to update status:", error?.message || error);
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, malId, isInWatchlist, getAccessToken, router]);

  const handleRemoveFromWatchlist = useCallback(async () => {
    if (!isAuthenticated || !malId) return;

    try {
      setIsSaving(true);
      const token = await getAccessToken();
      
      if (!token) {
        router.push("/login");
        return;
      }

      await userService.removeFromWatchlist(token, malId);
      setIsInWatchlist(false);
      setWatchlistItem(null);
      setShowStatusDropdown(false);
    } catch (error: any) {
      console.error("[Watchlist] Failed to remove from watchlist:", error?.message || error);
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, malId, getAccessToken, router]);

  const getCurrentStatusOption = () => {
    return STATUS_OPTIONS.find(opt => opt.value === watchlistItem?.status) || STATUS_OPTIONS[4];
  };

  const handleToggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!malId) {
      console.error("No MAL ID available for this anime");
      return;
    }

    try {
      setIsFavoriting(true);
      const token = await getAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }

      if (isFavorite) {
        await userService.removeFromFavorites(token, malId);
        setIsFavorite(false);
      } else {
        await userService.addToFavorites(token, malId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Failed to update favorites:", error);
    } finally {
      setIsFavoriting(false);
    }
  }, [isAuthenticated, malId, isFavorite, getAccessToken, router]);

  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] xl:h-[80vh] bg-background rounded-b-[2rem] sm:rounded-b-[3rem] overflow-hidden shadow-2xl flex items-center z-10">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent z-10" />
        
        {anime.bannerImage ? (
          <Image
            src={anime.bannerImage}
            alt={anime.title}
            fill
            className="object-cover opacity-90 transition-opacity duration-700"
            priority
          />
        ) : anime.posterUrl ? (
          <Image
            src={anime.posterUrl}
            alt={anime.title}
            fill
            className="object-cover blur-md scale-105 opacity-70 transition-opacity duration-700"
            priority
          />
        ) : null}
      </div>

      {/* Content Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative z-20 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr] gap-6 lg:gap-10 xl:gap-16 items-start">
          
            {/* Left: Poster Card */}
            <div className="hidden lg:block relative group mt-4">
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 transition-all duration-500 hover:scale-[1.02]">
              {anime.posterUrl && (
                <Image
                  src={anime.posterUrl}
                  alt={anime.title}
                  fill
                  className="object-cover transition-transform duration-700"
                  priority
                />
              )}
            </div>
          </div>

          {/* Right: Info & Actions */}
            <div className="flex flex-col space-y-4 sm:space-y-5 lg:space-y-6">
            
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
                {anime.title}
              </h1>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm lg:text-base font-medium text-white/90">
                <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-400">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "w-3 h-3 sm:w-4 sm:h-4 fill-current", 
                          star <= Math.round((parseFloat(anime.score?.toString() || "0") / 2)) ? "text-yellow-400" : "text-white/20"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="font-bold text-sm sm:text-lg text-white ml-1">
                    {anime.score ? parseFloat(anime.score.toString()).toFixed(1) : "N/A"}
                  </span>
                </div>

                <span className="text-white/40 hidden sm:inline">|</span>
                <span>{anime.year}</span>
                
                <span className="text-white/40 hidden sm:inline">|</span>
                <span className="hidden sm:inline">{anime.season}</span>
                
                <span className="text-white/40 hidden md:inline">|</span>
                <span className="hidden md:inline">{anime.totalEpisodes ? `${anime.totalEpisodes} Episodes` : "? Eps"}</span>
                
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] sm:text-xs uppercase tracking-wide",
                  anime.status?.toLowerCase().includes("ongoing") || anime.status?.toLowerCase().includes("releasing") 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-white/10 text-white/70"
                )}>
                  {anime.status}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 text-white/70 text-xs sm:text-sm">
                <span className="text-white/40">Genres:</span>
                <span className="font-medium text-white">{anime.genres?.slice(0, 4).join(", ")}</span>
            </div>

            {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 py-2">
              <Button 
                variant="primary" 
                size="lg" 
                  className="rounded-full px-5 sm:px-8 h-10 sm:h-12 text-sm sm:text-base font-bold gap-2 shadow-lg shadow-primary/10"
                onClick={handleWatchNow}
              >
                  <Play className="w-4 h-4 fill-current" />
                <span>Start Watching</span>
              </Button>
              
              {/* Add to Watchlist Button with Status Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <Button 
                  variant="default" 
                  size="lg" 
                  className={cn(
                      "rounded-full h-10 sm:h-12 px-4 sm:px-6 gap-2 border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all",
                      isInWatchlist && "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                  )}
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push("/login");
                      return;
                    }
                    setShowStatusDropdown(!showStatusDropdown);
                  }}
                  disabled={isSaving}
                >
                  {isInWatchlist ? (
                    <>
                      {getCurrentStatusOption().icon}
                      <span className="hidden sm:inline">{getCurrentStatusOption().label}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform", showStatusDropdown && "rotate-180")} />
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add to List</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform", showStatusDropdown && "rotate-180")} />
                    </>
                  )}
                </Button>

                {/* Status Dropdown Menu */}
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 mt-2 py-2 bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-50 min-w-[180px] overflow-hidden">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        className={cn(
                          "w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 transition-colors",
                          watchlistItem?.status === option.value
                            ? "bg-primary/20 text-primary"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {watchlistItem?.status === option.value && (
                          <Check className="w-3 h-3 ml-auto" />
                        )}
                      </button>
                    ))}
                    
                    {/* Remove from list option */}
                    {isInWatchlist && (
                      <>
                        <div className="border-t border-white/10 my-1" />
                        <button
                          onClick={handleRemoveFromWatchlist}
                          className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Remove from List</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Favorite Button */}
              <Button 
                variant="default" 
                size="icon" 
                className={cn(
                    "rounded-full h-10 w-10 sm:h-12 sm:w-12 border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all",
                    isFavorite && "bg-pink-600 text-white hover:bg-pink-700 border-pink-600"
                )}
                onClick={handleToggleFavorite}
                disabled={isFavoriting}
              >
                <Heart className={cn("w-4 h-4 sm:w-5 sm:h-5", isFavorite && "fill-current")} />
              </Button>
            </div>

              {/* Description */}
            <div className="relative max-w-3xl">
              <div className={cn(
                  "text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed font-light transition-all duration-500",
                  !isExpanded && "max-h-[4.5rem] sm:max-h-[6rem] overflow-hidden"
              )}>
                  <p>{anime.description?.replace(/<[^>]*>?/gm, '')}</p>
              </div>
              
                {anime.description && anime.description.length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-white/60 hover:text-white flex items-center gap-1 transition-all"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                </button>
              )}
            </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
