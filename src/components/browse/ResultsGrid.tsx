import React from "react";
import { IAnimeSearchResult } from "@/types/anime";
import AnimeCard from "../cards/AnimeCard";
import { Loader2, SearchX, Frown } from "lucide-react";

interface ResultsGridProps {
  results: IAnimeSearchResult[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  loadMoreRef: (node?: Element | null) => void;
  hasMore?: boolean;
  hasSearched?: boolean;
  searchQuery?: string;
}

function SkeletonCard() {
  return (
    <div className="relative aspect-[2/3] bg-white/[0.02] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute top-3 left-3 w-14 h-5 bg-white/5 rounded-md animate-pulse" />
      <div className="absolute top-3 right-3 w-12 h-5 bg-white/5 rounded-md animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse mt-2" />
      </div>
    </div>
  );
}

export default function ResultsGrid({
  results,
  isLoading,
  isLoadingMore = false,
  loadMoreRef,
  hasMore = true,
  hasSearched = false,
  searchQuery = "",
}: ResultsGridProps) {
  const skeletonCards = Array(18).fill(null);

  // Show empty state only after search has completed and there are no results
  const showEmptyState = hasSearched && !isLoading && results.length === 0;

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {/* Skeleton cards when initially loading */}
        {isLoading && results.length === 0 && 
          skeletonCards.map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))
        }
        
        {/* Results */}
        {!isLoading && results.map((result, index) => (
          <React.Fragment key={result.id}>
            <AnimeCard
              id={result.id}
              title={result.title}
              posterUrl={result.coverImage}
              type={result.format}
              rating={result.rating}
              status={result.status}
              year={result.seasonYear}
              episodes={result.episodes}
              genres={result.genres}
            />
            {/* Load more trigger - placed before last few items */}
            {index === results.length - 6 && hasMore && (
              <div ref={loadMoreRef} className="absolute" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-white/5" />
            <Loader2 className="w-12 h-12 text-white/40 animate-spin absolute inset-0" />
          </div>
          <span className="text-sm text-white/30">Loading more...</span>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && results.length > 0 && !isLoadingMore && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-white/20">
            <div className="h-px w-12 bg-white/10" />
            <span className="text-sm">End of results</span>
            <div className="h-px w-12 bg-white/10" />
          </div>
        </div>
      )}

      {/* Empty state */}
      {showEmptyState && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
            {searchQuery ? (
              <SearchX className="w-10 h-10 text-white/20" />
            ) : (
              <Frown className="w-10 h-10 text-white/20" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-white/80 mb-2">
            {searchQuery ? "No results found" : "Nothing to show"}
          </h3>
          <p className="text-white/40 max-w-sm text-sm leading-relaxed">
            {searchQuery 
              ? `We couldn't find any anime matching "${searchQuery}". Try different keywords or adjust your filters.`
              : "Try searching for an anime or adjusting your filters to see results."
            }
          </p>
        </div>
      )}
    </div>
  );
}
