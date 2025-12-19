"use client";

import { Skeleton, SkeletonEpisodeList } from "@/components/ui/Skeleton";

export default function LoadingPage() {
  return (
    <div className="min-h-screen w-full bg-black">
      {/* Banner skeleton */}
      <div className="relative h-[50vh] w-full">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>
      
      {/* Content skeleton */}
      <div className="relative z-10 -mt-32 px-4 md:px-8 lg:px-16 container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <Skeleton className="w-48 md:w-64 aspect-[2/3] rounded-xl shrink-0" />
          
          {/* Info */}
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-36 rounded-lg" />
              <Skeleton className="h-12 w-36 rounded-lg" />
            </div>
          </div>
        </div>
        
        {/* Episodes section */}
        <div className="mt-12 space-y-4">
          <Skeleton className="h-8 w-32" />
          <SkeletonEpisodeList count={12} />
        </div>
      </div>
    </div>
  );
}
