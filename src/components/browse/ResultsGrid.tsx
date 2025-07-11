import React from "react";
import { IAnimeSearchResult } from "@/types/anime";
import SearchResultCard from "../cards/SearchResultCard";

interface ResultsGridProps {
  results: IAnimeSearchResult[];
  isLoading: boolean;
  loadMoreRef: (node?: Element | null) => void;
  viewMode: "grid" | "list";
}

function SkeletonCard() {
  return (
    <div className="relative bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden animate-pulse">
      {/* Thumbnail */}
      <div className="aspect-[3/4] bg-neutral-800/50" />
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-800/50 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-neutral-800/50 rounded w-full" />
          <div className="h-3 bg-neutral-800/50 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function ResultsGrid({
  results,
  isLoading,
  loadMoreRef,
  viewMode,
}: ResultsGridProps) {
  // Generate array of 20 skeleton cards
  const skeletonCards = Array(20).fill(null);

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-16">
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4`}>
        {/* Show skeleton cards when loading and no results */}
        {isLoading && results.length === 0 && 
          skeletonCards.map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))
        }
        
        {/* Show actual results */}
        {results.map((result, index) => (
          <React.Fragment key={result.id}>
            <SearchResultCard anime={result} viewMode={viewMode} />
            {/* Add load more ref to second to last item */}
            {index === results.length - 2 && (
              <div ref={loadMoreRef} className="col-span-full h-0" />
            )}
          </React.Fragment>
        ))}

        {/* Show loading indicator at bottom when loading more */}
        {isLoading && results.length > 0 && (
          <div className="col-span-full flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
} 