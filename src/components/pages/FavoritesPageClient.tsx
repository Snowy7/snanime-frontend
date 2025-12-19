"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService, FavoriteItem } from "@/services/user";
import { anilistService } from "@/services/global";
import { IAnime } from "@/types/anime";
import AnimeCard from "@/components/cards/AnimeCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FavoritesPageClient() {
  const { user, isAuthenticated, getAccessToken, signIn } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [animeDetails, setAnimeDetails] = useState<Map<number, IAnime>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const items = await userService.getFavorites(token);
      setFavorites(items);

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
      console.error("Failed to load favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-full bg-white/5 mb-6">
              <Heart className="w-12 h-12 text-white/40" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to view your favorites</h1>
            <p className="text-white/60 mb-6 max-w-md">
              Save your favorite anime for quick access. Build your collection of must-watch shows.
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Favorites</h1>
            <p className="text-white/60">{favorites.length} anime you love</p>
          </div>
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
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No favorites yet</p>
            <p className="text-white/40 text-sm mt-2">
              Click the heart icon on any anime to add it to your favorites
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
            {favorites.map((item) => {
              const anime = animeDetails.get(item.malId);
              return (
                <AnimeCard
                  key={item.id}
                  id={item.malId.toString()}
                  title={anime?.title || `Anime ${item.malId}`}
                  posterUrl={anime?.posterUrl || ""}
                  type={anime?.type}
                  totalEpisodes={anime?.totalEpisodes}
                  score={anime?.averageScore}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

