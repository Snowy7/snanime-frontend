"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService, WatchHistoryItem } from "@/services/user";
import { anilistService } from "@/services/global";
import { IAnime } from "@/types/anime";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { History, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "@/lib/utils";

export default function HistoryPageClient() {
  const { user, isAuthenticated, getAccessToken, signIn } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [animeDetails, setAnimeDetails] = useState<Map<number, IAnime>>(new Map());
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const items = await userService.getWatchHistory(token, { limit: 100 });
      setHistory(items);

      // Fetch anime details for all items
      const malIds = [...new Set(items.map(item => item.malId))];
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
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm("Are you sure you want to clear your watch history?")) return;
    
    setClearing(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      
      await userService.clearWatchHistory(token);
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    } finally {
      setClearing(false);
    }
  };

  // Group history by date
  const groupedHistory = history.reduce((groups, item) => {
    const date = new Date(item.watchedAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, WatchHistoryItem[]>);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-white/5 mb-6">
              <History className="w-12 h-12 text-white/40" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to view your watch history</h1>
            <p className="text-white/60 mb-6 max-w-md">
              Track what you&apos;ve watched and continue from where you left off.
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Watch History</h1>
              <p className="text-white/60">{history.length} episodes watched</p>
            </div>
          </div>
          
          {history.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={clearHistory}
              disabled={clearing}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5">
                <Skeleton className="w-32 aspect-video rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <History className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No watch history yet</p>
            <p className="text-white/40 text-sm mt-2">
              Start watching anime to build your history
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
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-white/60 mb-4">{date}</h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const anime = animeDetails.get(item.malId);
                    return (
                      <div 
                        key={item.id}
                        className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/anime/${item.malId}/watch/${item.episodeNumber}`)}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-32 md:w-40 aspect-video rounded-lg overflow-hidden bg-white/10 shrink-0">
                          {anime?.posterUrl && (
                            <Image
                              src={anime.posterUrl}
                              alt={anime.title}
                              fill
                              className="object-cover"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                          {/* Progress bar */}
                          {item.duration && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                              <div 
                                className="h-full bg-primary"
                                style={{ width: `${(item.progress / item.duration) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            {anime?.title || `Anime ${item.malId}`}
                          </h3>
                          <p className="text-sm text-white/60">
                            Episode {item.episodeNumber}
                            {item.completed && (
                              <span className="ml-2 text-green-400">✓ Completed</span>
                            )}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {formatDistanceToNow(new Date(item.watchedAt))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

