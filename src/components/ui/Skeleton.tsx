"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/10",
        className
      )}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
};

export const SkeletonHero: React.FC = () => {
  return (
    <div className="relative w-full h-[70vh] overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
      <div className="relative z-10 h-full flex items-center pt-28 pb-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Poster skeleton */}
            <Skeleton className="w-48 sm:w-56 lg:w-64 aspect-[2/3] rounded-2xl" />
            
            {/* Info skeleton */}
            <div className="flex-1 space-y-5 max-w-2xl">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-3">
                <Skeleton className="h-12 w-32 rounded-full" />
                <Skeleton className="h-12 w-32 rounded-full" />
              </div>
              <div className="flex gap-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonAnimeGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export const SkeletonEpisodeList: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonVideoPlayer: React.FC = () => {
  return (
    <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="text-white/60 text-sm">Loading video...</span>
      </div>
    </div>
  );
};

export default Skeleton;

