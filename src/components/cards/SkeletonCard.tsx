import React from "react";

interface SkeletonCardProps {
  viewMode?: "grid" | "list";
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ viewMode = "grid" }) => {
  const gridStyles = "relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl overflow-hidden animate-pulse";
  const listStyles = "relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl overflow-hidden animate-pulse flex";

  return (
    <div className={viewMode === "grid" ? gridStyles : listStyles}>
      {/* Image Skeleton */}
      <div className={viewMode === "grid" ? "aspect-[2/3] w-full bg-neutral-800" : "aspect-[16/9] w-48 bg-neutral-800"} />

      {/* Content Skeleton */}
      <div className="p-4 flex-1">
        {/* Title Skeleton */}
        <div className="h-6 bg-neutral-800 rounded-md w-3/4 mb-4" />

        {/* Info Skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-4 bg-neutral-800 rounded w-16" />
          <div className="h-4 bg-neutral-800 rounded w-16" />
          <div className="h-4 bg-neutral-800 rounded w-16" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-neutral-800 rounded-full w-16" />
          <div className="h-6 bg-neutral-800 rounded-full w-20" />
          <div className="h-6 bg-neutral-800 rounded-full w-14" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard; 