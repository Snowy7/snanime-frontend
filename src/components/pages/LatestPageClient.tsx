"use client";

import React, { useState } from "react";
import { IAnimeLatest, IPaginatedResult } from "@/types/anime";
import LatestEpisodeCard from "@/components/cards/LatestEpisodeCard";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { snanimeService } from "@/services/global";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from "@/components/ui/Skeleton";

interface LatestPageClientProps {
  initialData: IPaginatedResult<IAnimeLatest> | null;
}

export default function LatestPageClient({ initialData }: LatestPageClientProps) {
  const [episodes, setEpisodes] = useState<IAnimeLatest[]>(initialData?.items || []);
  const [currentPage, setCurrentPage] = useState(initialData?.currentPage || 1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();

  const loadPage = async (page: number) => {
    setLoading(true);
    try {
      const result = await snanimeService.getLatestAnime({ page: page.toString(), limit: "30" }, language);
      if (result) {
        setEpisodes(result.items);
        setCurrentPage(result.currentPage);
        setTotalPages(result.totalPages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Failed to load latest episodes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Latest Episodes</h1>
            <p className="text-white/60">Recently released anime episodes</p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No episodes available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {episodes.map((episode) => (
              <LatestEpisodeCard
                key={episode.id}
                episode={episode}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {episodes.length > 0 && (
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
        )}
      </div>
    </main>
  );
}

