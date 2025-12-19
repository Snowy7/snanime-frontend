"use client";

import { Skeleton, SkeletonAnimeGrid } from "@/components/ui/Skeleton";
import { Bookmark } from "lucide-react";

export default function WatchlistLoading() {
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
            <Skeleton className="h-5 w-32 mt-1" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>

        {/* Grid Skeleton */}
        <SkeletonAnimeGrid count={12} />
      </div>
    </main>
  );
}

