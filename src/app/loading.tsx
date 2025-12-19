"use client";

import { SkeletonHero, SkeletonAnimeGrid } from "@/components/ui/Skeleton";

export default function LoadingPage() {
  return (
    <main className="min-h-screen w-full text-white bg-background">
      {/* Hero skeleton */}
      <SkeletonHero />
      
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Trending section skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
          <SkeletonAnimeGrid count={6} />
        </div>
        
        {/* Latest section skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
          <SkeletonAnimeGrid count={12} />
        </div>
      </div>
    </main>
  );
}
