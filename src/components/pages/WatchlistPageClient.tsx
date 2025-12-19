"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService, WatchlistItem, WatchStatus } from "@/services/user";
import { anilistService } from "@/services/global";
import { IAnime } from "@/types/anime";
import AnimeCard from "@/components/cards/AnimeCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Bookmark, Play, CheckCircle, PauseCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const statusTabs: { value: WatchStatus | "ALL"; label: string; icon: React.ReactNode }[] = [
  { value: "ALL", label: "All", icon: <Bookmark className="w-4 h-4" /> },
  { value: "WATCHING", label: "Watching", icon: <Play className="w-4 h-4" /> },
  { value: "COMPLETED", label: "Completed", icon: <CheckCircle className="w-4 h-4" /> },
  { value: "ON_HOLD", label: "On Hold", icon: <PauseCircle className="w-4 h-4" /> },
  { value: "DROPPED", label: "Dropped", icon: <XCircle className="w-4 h-4" /> },
  { value: "PLAN_TO_WATCH", label: "Plan to Watch", icon: <Clock className="w-4 h-4" /> },
];

export default function WatchlistPageClient() {
  const { user, isAuthenticated, getAccessToken, signIn } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [animeDetails, setAnimeDetails] = useState<Map<number, IAnime>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WatchStatus | "ALL">("ALL");

  useEffect(() => {
    if (isAuthenticated) {
      loadWatchlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadWatchlist = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const items = await userService.getWatchlist(token);
      setWatchlist(items);

      // Fetch anime details for all items
      const malIds = items.map(item => item.malId);
      if (malIds.length > 0) {
        const animeList = await anilistService.getAnimesByMalIds(malIds);
        const detailsMap = new Map<number, IAnime>();
        animeList.forEach(anime => {
          if (anime.malId) {
            detailsMap.set(anime.malId, anime);
          }
        });
        setAnimeDetails(detailsMap);
      }
    } catch (error) {
      console.error("Failed to load watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWatchlist = activeTab === "ALL" 
    ? watchlist 
    : watchlist.filter(item => item.status === activeTab);

  const getStatusCounts = () => {
    const counts: Record<string, number> = { ALL: watchlist.length };
    watchlist.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return counts;
  };

  const counts = getStatusCounts();

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-white/5 mb-6">
              <Bookmark className="w-12 h-12 text-white/40" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to view your watchlist</h1>
            <p className="text-white/60 mb-6 max-w-md">
              Keep track of your favorite anime, mark episodes as watched, and never lose your progress.
            </p>
            <Button onClick={() => signIn()} size="lg" className="gap-2">
              Sign In
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
            <p className="text-white/60">{watchlist.length} anime in your list</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {statusTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "gap-2",
                activeTab === tab.value ? "" : "text-white/60"
              )}
            >
              {tab.icon}
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/10 text-xs">
                {counts[tab.value] || 0}
              </span>
            </Button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredWatchlist.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">
              {activeTab === "ALL" 
                ? "Your watchlist is empty" 
                : `No anime in "${statusTabs.find(t => t.value === activeTab)?.label}"`}
            </p>
            <Button 
              variant="ghost" 
              className="mt-4"
              onClick={() => router.push("/browse")}
            >
              Browse Anime
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredWatchlist.map((item) => {
              const anime = animeDetails.get(item.malId);
              return (
                <div key={item.id} className="relative group">
                  <AnimeCard
                    id={item.malId.toString()}
                    title={anime?.title || `Anime ${item.malId}`}
                    posterUrl={anime?.posterUrl || ""}
                    type={anime?.type}
                    totalEpisodes={anime?.totalEpisodes}
                    score={anime?.averageScore}
                  />
                  {/* Progress indicator */}
                  {item.progress > 0 && anime?.totalEpisodes && (
                    <div className="absolute bottom-20 left-2 right-2">
                      <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(item.progress / anime.totalEpisodes) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/60 mt-1">
                        {item.progress}/{anime.totalEpisodes} episodes
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

