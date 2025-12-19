"use client";

import { Skeleton, SkeletonAnimeGrid } from "@/components/ui/Skeleton";
import { Clock } from "lucide-react";

export default function LatestLoading() {
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
            <Skeleton className="h-5 w-48 mt-1" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <SkeletonAnimeGrid count={30} />
      </div>
    </main>
  );
}

