"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAnimeSearch } from "@/hooks/anime/useAnimeSearch";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { AnimeFormat, AnimeSeason, AnimeSort, AnimeStatus, IAnimeSearchResult } from "@/types/anime";
import ResultsGrid from "@/components/browse/ResultsGrid";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FilterState {
  format: AnimeFormat[];
  season?: AnimeSeason;
  seasonYear?: number;
  status?: AnimeStatus;
  genres: string[];
  sort: AnimeSort[];
}

const SEASONS: AnimeSeason[] = ["WINTER", "SPRING", "SUMMER", "FALL"];
const FORMATS: AnimeFormat[] = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL"];
const STATUSES: AnimeStatus[] = ["FINISHED", "RELEASING", "NOT_YET_RELEASED"];
const SORT_OPTIONS: { value: AnimeSort; label: string }[] = [
  { value: "POPULARITY_DESC", label: "Most Popular" },
  { value: "SCORE_DESC", label: "Highest Rated" },
  { value: "START_DATE_DESC", label: "Release Date" },
  { value: "EPISODES_DESC", label: "Most Episodes" },
];

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Supernatural", "Thriller"
];

const INITIAL_FILTERS: FilterState = {
  format: [],
  season: undefined,
  seasonYear: undefined,
  status: undefined,
  genres: [],
  sort: ["POPULARITY_DESC"],
};

export default function BrowsePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, getDirection } = useLanguage();
  const { searchAnimes } = useAnimeSearch();
  
  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const searchQueryRef = useRef(searchQuery);
  const [searchResults, setSearchResults] = useState<IAnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  // Check if any filter is applied
  const hasActiveFilters = 
    filters.format.length > 0 || 
    filters.genres.length > 0 || 
    filters.season || 
    filters.seasonYear || 
    filters.status;

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const q = searchQueryRef.current?.trim() || "";
      
      const results = await searchAnimes({
        query: q, 
        page: 1,
        perPage: 24,
        format: filters.format as AnimeFormat[],
        season: filters.season as AnimeSeason,
        seasonYear: filters.seasonYear,
        status: filters.status as AnimeStatus,
        genres: filters.genres,
        sort: filters.sort,
      });

      setSearchResults(results.items);
      setHasMore(results.hasNextPage);
      setCurrentPage(2);
      setHasSearched(true);
    } catch (error) {
      console.error("Search error:", error);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const results = await searchAnimes({
        query: searchQueryRef.current || "",
        page: currentPage,
        perPage: 24,
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
      setIsLoadingMore(false);
    }
  }, [currentPage, filters, searchAnimes, isLoading, isLoadingMore, hasMore]);

  const { loadMoreRef } = useInfiniteScroll(loadMore, hasMore);

  // Handle URL search param
  useEffect(() => {
    const query = searchParams.get("search");
    if (query !== null) {
      setSearchQuery(query);
      searchQueryRef.current = query;
    }
  }, [searchParams]);

  // Perform search on mount and when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Initial search on mount
  useEffect(() => {
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchQueryRef.current = searchQuery;
    setCurrentPage(1);
    performSearch();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleArrayFilter = (key: "format" | "genres", value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: newValue };
    });
  };

  const removeFilter = (type: string, value?: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === "format" && value) {
        newFilters.format = prev.format.filter(f => f !== value);
      } else if (type === "genres" && value) {
        newFilters.genres = prev.genres.filter(g => g !== value);
      } else if (type === "season") {
        newFilters.season = undefined;
      } else if (type === "seasonYear") {
        newFilters.seasonYear = undefined;
      } else if (type === "status") {
        newFilters.status = undefined;
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    setIsFilterModalOpen(false);
  };

  const isRTL = getDirection() === "rtl";
  const currentSort = SORT_OPTIONS.find(o => o.value === filters.sort[0]) || SORT_OPTIONS[0];

  return (
    <div className={`min-h-screen bg-background pt-28 pb-12 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Centered Search Header */}
        <div className="flex flex-col items-center mb-10">
          {/* Search Bar - Centered and larger */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl mb-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anime..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-14 py-4 text-base text-white placeholder-white/30 focus:bg-white/[0.06] focus:border-white/20 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchQueryRef.current = "";
                    performSearch();
                  }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Filter and Sort Row */}
          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border",
                hasActiveFilters
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-white/[0.03] text-white/60 border-white/10 hover:bg-white/[0.06] hover:text-white hover:border-white/20"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-foreground/20 text-[10px] font-bold">
                  {filters.format.length + filters.genres.length + (filters.season ? 1 : 0) + (filters.seasonYear ? 1 : 0) + (filters.status ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/[0.03] border border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/20 transition-all"
              >
                <span>{currentSort.label}</span>
                <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", isSortOpen && "rotate-180")} />
              </button>

              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 py-1.5 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 min-w-[180px]">
                    {SORT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleFilterChange("sort", [option.value]);
                          setIsSortOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between",
                          filters.sort[0] === option.value
                            ? "text-primary bg-primary/5"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {option.label}
                        {filters.sort[0] === option.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {filters.format.map(format => (
              <ActiveFilterTag key={format} label={format.replace(/_/g, " ")} onRemove={() => removeFilter("format", format)} />
            ))}
            {filters.genres.map(genre => (
              <ActiveFilterTag key={genre} label={genre} onRemove={() => removeFilter("genres", genre)} />
            ))}
            {filters.season && (
              <ActiveFilterTag label={filters.season} onRemove={() => removeFilter("season")} />
            )}
            {filters.seasonYear && (
              <ActiveFilterTag label={String(filters.seasonYear)} onRemove={() => removeFilter("seasonYear")} />
            )}
            {filters.status && (
              <ActiveFilterTag label={filters.status === "RELEASING" ? "Ongoing" : filters.status === "NOT_YET_RELEASED" ? "Upcoming" : "Finished"} onRemove={() => removeFilter("status")} />
            )}
            <button
              onClick={clearAllFilters}
              className="text-sm text-white/40 hover:text-white transition-colors ml-2 font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Results */}
        <ResultsGrid
          results={searchResults}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          loadMoreRef={loadMoreRef}
          hasMore={hasMore}
          hasSearched={hasSearched}
          searchQuery={searchQuery}
        />
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-neutral-900 z-10">
                <h2 className="text-xl font-bold text-white">Filters</h2>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                {/* Format Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Format</h3>
                  <div className="flex flex-wrap gap-2">
                    {FORMATS.map(format => (
                      <FilterPill
                        key={format}
                        active={filters.format.includes(format)}
                        onClick={() => toggleArrayFilter("format", format)}
                      >
                        {format.replace(/_/g, " ")}
                      </FilterPill>
                    ))}
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map(status => (
                      <FilterPill
                        key={status}
                        active={filters.status === status}
                        onClick={() => handleFilterChange("status", filters.status === status ? undefined : status)}
                      >
                        {status === "RELEASING" ? "Ongoing" : status === "NOT_YET_RELEASED" ? "Upcoming" : "Finished"}
                      </FilterPill>
                    ))}
                  </div>
                </div>

                {/* Season & Year Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Season</h3>
                    <div className="flex flex-wrap gap-2">
                      {SEASONS.map(season => (
                        <FilterPill
                          key={season}
                          active={filters.season === season}
                          onClick={() => handleFilterChange("season", filters.season === season ? undefined : season)}
                        >
                          {season}
                        </FilterPill>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Year</h3>
                    <div className="relative">
                      <select
                        value={filters.seasonYear || ""}
                        onChange={(e) => handleFilterChange("seasonYear", e.target.value ? parseInt(e.target.value) : undefined)}
                        className={cn(
                          "w-full appearance-none px-4 py-2.5 pr-10 rounded-xl text-sm font-medium border cursor-pointer transition-all outline-none focus:ring-1 focus:ring-primary/50",
                          filters.seasonYear 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        )}
                      >
                        <option value="" className="bg-neutral-900 text-white/50">Any Year</option>
                        {years.map(year => (
                          <option key={year} value={year} className="bg-neutral-900 text-white">{year}</option>
                        ))}
                      </select>
                      <ChevronDown className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors",
                        filters.seasonYear ? "text-primary-foreground/70" : "text-white/50"
                      )} />
                    </div>
                  </div>
                </div>

                {/* Genres Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <FilterPill
                        key={genre}
                        active={filters.genres.includes(genre)}
                        onClick={() => toggleArrayFilter("genres", genre)}
                      >
                        {genre}
                      </FilterPill>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 bg-neutral-900 z-10 flex items-center justify-between gap-4">
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Filter Pill Component
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
        active
          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20"
      )}
    >
      {children}
    </button>
  );
}

// Active Filter Tag Component
function ActiveFilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-white/70 border border-white/10 text-xs font-medium">
      <span>{label}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove();
        }}
        className="p-0.5 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
