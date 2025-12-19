"use client";

import { Skeleton, SkeletonAnimeGrid } from "@/components/ui/Skeleton";
import { TrendingUp } from "lucide-react";

export default function TrendingLoading() {
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
            <Skeleton className="h-5 w-48 mt-1" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <SkeletonAnimeGrid count={24} />
      </div>
    </main>
  );
}

