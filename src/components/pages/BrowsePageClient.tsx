"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useAnime } from "@/context/AnimeContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { AnimeFormat, AnimeSeason, AnimeSort, AnimeStatus, IAnimeSearchResult } from "@/types/anime";
import SearchBar from "@/components/browse/SearchBar";
import FilterControls from "@/components/browse/FilterControls";
import FilterPanel from "@/components/browse/FilterPanel";
import ResultsGrid from "@/components/browse/ResultsGrid";

interface FilterState {
  format: AnimeFormat[];
  season?: AnimeSeason;
  seasonYear?: number;
  status?: AnimeStatus;
  genres: string[];
  sort: AnimeSort[];
}

const SEASONS: AnimeSeason[] = ["WINTER", "SPRING", "SUMMER", "FALL"];
const FORMATS: AnimeFormat[] = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL", "TV_SHORT", "MUSIC"];
const STATUSES: AnimeStatus[] = ["FINISHED", "RELEASING", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"];
const SORT_OPTIONS: { value: AnimeSort; label: string }[] = [
  { value: "SEARCH_MATCH", label: "Search Relevance" },
  { value: "POPULARITY_DESC", label: "Most Popular" },
  { value: "SCORE_DESC", label: "Highest Rated" },
  { value: "START_DATE_DESC", label: "Recently Started" },
  { value: "EPISODES_DESC", label: "Most Episodes" },
];

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mecha",
  "Music", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life",
  "Sports", "Supernatural", "Thriller"
];

const INITIAL_FILTERS: FilterState = {
  format: [],
  season: undefined,
  seasonYear: undefined,
  status: undefined,
  genres: [],
  sort: ["SEARCH_MATCH", "POPULARITY_DESC"],
};

export default function BrowsePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, getDirection } = useLanguage();
  const { searchAnimes } = useAnime();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const searchQueryRef = useRef(searchQuery);
  const [searchResults, setSearchResults] = useState<IAnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const performSearch = async () => {
    if (!searchQueryRef.current.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await searchAnimes({
        query: searchQueryRef.current,
        page: 1, // Always start from page 1 for new searches
        perPage: 20,
        format: filters.format as AnimeFormat[],
        season: filters.season as AnimeSeason,
        seasonYear: filters.seasonYear,
        status: filters.status as AnimeStatus,
        genres: filters.genres,
        sort: filters.sort,
      });

      setSearchResults(results.items);
      setHasMore(results.hasNextPage);
      setCurrentPage(2); // Set to 2 since we just loaded page 1
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!searchQueryRef.current.trim() || !hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const results = await searchAnimes({
        query: searchQueryRef.current,
        page: currentPage,
        perPage: 20,
        format: filters.format as AnimeFormat[],
        season: filters.season as AnimeSeason,
        seasonYear: filters.seasonYear,
        status: filters.status as AnimeStatus,
        genres: filters.genres,
        sort: filters.sort,
      });

      setSearchResults(prev => [...prev, ...results.items]);
      setHasMore(results.hasNextPage);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, searchAnimes, isLoading, hasMore]);

  const { loadMoreRef } = useInfiniteScroll(loadMore, hasMore);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
      searchQueryRef.current = query; // Update the ref
    }
  }, [searchParams]);

  // This effect now only runs when filters change, not when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setCurrentPage(1);
      setHasMore(true);
      performSearch();
    }
  }, [filters]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    searchQueryRef.current = query;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUrl = searchQuery ? `/browse?search=${encodeURIComponent(searchQuery)}` : "/browse";
    router.push(newUrl);
    
    // Reset state for new search
    setSearchResults([]);
    setCurrentPage(1);
    setHasMore(true);
    performSearch();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setIsFilterApplied(true);
    setCurrentPage(1);
    setHasMore(true);
    setSearchResults([]);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setIsFilterApplied(false);
    setCurrentPage(1);
    setHasMore(true);
    setSearchResults([]);
  };

  const isRTL = getDirection() === "rtl";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Hero Section with Search */}
      <div className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
          />

          <FilterControls
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            isFilterApplied={isFilterApplied}
            clearFilters={clearFilters}
            filters={filters}
            onFilterChange={handleFilterChange}
            SORT_OPTIONS={SORT_OPTIONS}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>

      {/* Enhanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-neutral-800 bg-black/30 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              FORMATS={FORMATS}
              SEASONS={SEASONS}
              STATUSES={STATUSES}
              GENRES={GENRES}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <ResultsGrid
        results={searchResults}
        isLoading={isLoading}
        loadMoreRef={loadMoreRef}
        viewMode={viewMode}
      />
    </div>
  );
}

