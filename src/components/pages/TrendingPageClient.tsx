"use client";

import React, { useState } from "react";
import { IAnime, IPaginatedResult } from "@/types/anime";
import AnimeCard from "@/components/cards/AnimeCard";
import { Button } from "@/components/ui/button";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { anilistService } from "@/services/global";
import { Skeleton } from "@/components/ui/Skeleton";

interface TrendingPageClientProps {
  initialData: IPaginatedResult<IAnime>;
}

export default function TrendingPageClient({ initialData }: TrendingPageClientProps) {
  const [animeList, setAnimeList] = useState<IAnime[]>(initialData.items);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [loading, setLoading] = useState(false);

  const loadPage = async (page: number) => {
    setLoading(true);
    try {
      const result = await anilistService.getSpotlight(page, 24);
      setAnimeList(result.items);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Failed to load trending anime:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Trending Anime</h1>
            <p className="text-white/60">Discover what&apos;s hot right now</p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {animeList.map((anime, index) => (
              <AnimeCard
                key={anime.id}
                id={anime.malId?.toString() || anime.id}
                title={anime.title}
                posterUrl={anime.posterUrl}
                type={anime.type}
                totalEpisodes={anime.totalEpisodes}
                score={anime.averageScore}
                rank={index + 1 + (currentPage - 1) * 24}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <Button
            variant="ghost"
            size="lg"
            disabled={currentPage <= 1 || loading}
            onClick={() => loadPage(currentPage - 1)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => loadPage(pageNum)}
                  disabled={loading}
                  className="w-10 h-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="ghost"
            size="lg"
            disabled={currentPage >= totalPages || loading}
            onClick={() => loadPage(currentPage + 1)}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}

