"use client";

import { Skeleton, SkeletonVideoPlayer } from "@/components/ui/Skeleton";

export default function LoadingPage() {
  return (
    <div className="min-h-screen w-full bg-black">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Video player skeleton */}
          <div className="flex-1">
            <SkeletonVideoPlayer />
            
            {/* Video info skeleton */}
            <div className="mt-4 space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>
          
          {/* Episode list sidebar skeleton */}
          <div className="w-full lg:w-80 space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
