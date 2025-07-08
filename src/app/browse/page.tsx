"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Star,
  SlidersHorizontal,
  ChevronDown,
  X,
  TrendingUp,
  Clock,
  Check,
  TvIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SnAnimeService } from "@/services/snanime";
import AnimeCard from "@/components/cards/AnimeCard";
import { ControlButton } from "@/components/ui/button";
import { useAnime } from "@/context/AnimeContext";
import { useLanguage } from "@/context/LanguageContext";

interface FilterState {
  genres: string[];
  types: string[];
  status: string[];
  year: { min: number; max: number };
  rating: { min: number; max: number };
  sortBy: "title" | "year" | "rating" | "popularity";
  sortOrder: "asc" | "desc";
}

const BrowsePageClient: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, getDirection } = useLanguage();
  const { searchAnimes, getTopAnimes } = useAnime();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [searchResults, setSearchResults] = useState<SnAnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    types: [],
    status: [],
    year: { min: 1990, max: new Date().getFullYear() },
    rating: { min: 0, max: 10 },
    sortBy: "popularity",
    sortOrder: "desc",
  });

  // Filter options - these would normally come from your API
  const genreOptions = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
    "Mecha",
    "Music",
    "Psychological",
    "Historical",
    "Military",
  ];

  const typeOptions = ["TV", "Movie", "OVA", "ONA", "Special", "Music"];
  const statusOptions = ["Airing", "Finished Airing", "Not Yet Aired"];

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchQuery || isFilterApplied) {
      performSearch();
    } else {
      // Load popular anime by default
      loadPopularAnime();
    }
  }, [searchQuery, currentPage, filters, isFilterApplied]);

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await searchAnimes(searchQuery, currentPage, 20);

      // Apply client-side filters (until backend filtering is implemented)
      let filteredResults = results.results;

      if (isFilterApplied) {
        filteredResults = applyFilters(filteredResults);
      }

      setSearchResults(filteredResults);
      setTotalResults(results.totalPages * results.results.length);
      setTotalPages(results.totalPages);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentPage, filters, isFilterApplied]);

  const loadPopularAnime = useCallback(async () => {
    setIsLoading(true);
    try {
      // This is a placeholder - you'll need to implement getPopularAnime in your service
      const results = await getTopAnimes();
      setSearchResults(
        results.results.map((anime) => ({
          ...anime,
          id: anime.id,
          title: anime.title,
          url: anime.url,
          image: anime.banner,
          duration: anime.duration,
          japaneseTitle: anime.japaneseTitle,
          type: anime.type,
          sub: anime.sub,
          dub: anime.dub,
          nsfw: false, // Assuming default
          episodes: anime.episodes,
        }))
      );
      setTotalResults(results.results.length);
      setTotalPages(1);
    } catch (error) {
      console.error("Error loading popular anime:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = (results: SnAnimeSearchResult[]): SnAnimeSearchResult[] => {
    return results
      .filter((anime) => {
        // Type filter
        if (filters.types.length > 0 && !filters.types.includes(anime.type)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          // Sorting by year, rating, and popularity is not possible with SnAnimeSearchResult
          // You might want to adjust the SearchResult type or the API response
          case "year":
          case "rating":
          case "popularity":
            comparison = 0; // No-op
            break;
        }

        return filters.sortOrder === "asc" ? comparison : -comparison;
      });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const newUrl = searchQuery ? `/browse?search=${encodeURIComponent(searchQuery)}` : "/browse";
    router.push(newUrl);
  };

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setIsFilterApplied(true);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      genres: [],
      types: [],
      status: [],
      year: { min: 1990, max: new Date().getFullYear() },
      rating: { min: 0, max: 10 },
      sortBy: "popularity",
      sortOrder: "desc",
    });
    setIsFilterApplied(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Custom Checkbox Component
  const CustomCheckbox = ({
    checked,
    onChange,
    label,
    count,
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
    count?: number;
  }) => (
    <motion.label
      className="group flex items-center justify-between p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/70 cursor-pointer transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
          <div
            className={`w-5 h-5 rounded-md border-2 transition-all duration-200 ${
              checked
                ? "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 shadow-lg shadow-blue-500/25"
                : "border-neutral-600 bg-neutral-800/50 group-hover:border-neutral-500"
            }`}
          >
            {checked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center h-full"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>
        </div>
        <span
          className={`text-sm transition-colors ${
            checked ? "text-white font-medium" : "text-neutral-300 group-hover:text-white"
          }`}
        >
          {label}
        </span>
      </div>
      {count && (
        <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </motion.label>
  );

  const isRTL = getDirection() === "rtl";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Hero Section with Search */}
      <div className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              {t("browse.title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-neutral-300 mb-8"
            >
              {t("browse.subtitle")}
            </motion.p>
          </div>

          {/* Enhanced Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <Search
                className={`absolute ${
                  isRTL ? "right-4" : "left-4"
                } top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("browse.searchPlaceholder")}
                className={`w-full ${
                  isRTL ? "pr-12 pl-12" : "pl-12 pr-12"
                } py-4 bg-black/50 backdrop-blur-lg text-white rounded-2xl border border-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg shadow-xl`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={`absolute ${
                    isRTL ? "left-4" : "right-4"
                  } top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-800`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.form>

          {/* Enhanced Filter and View Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 shadow-lg ${
                  showFilters
                    ? "bg-gradient-to-r from-white/10 to-white/20 border-blue-500 text-white shadow-blue-500/25"
                    : "bg-black/50 backdrop-blur-sm border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-black/70"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t("browse.filters.title")}
                {isFilterApplied && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
                  />
                )}
              </motion.button>

              <AnimatePresence>
                {isFilterApplied && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800"
                  >
                    <X className="w-4 h-4" />
                    {t("browse.clearFilters")}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4">
              {/* Enhanced View Mode Toggle */}
              <div className="flex items-center bg-black/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-white/10 to-white/20 text-white shadow-lg"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-white/10 to-white/20 text-white shadow-lg"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="relative">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-") as [
                      FilterState["sortBy"],
                      FilterState["sortOrder"]
                    ];
                    handleFilterChange("sortBy", sortBy);
                    handleFilterChange("sortOrder", sortOrder);
                  }}
                  className="appearance-none bg-black/50 backdrop-blur-sm border border-neutral-700 text-white rounded-xl px-4 py-3 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-lg"
                >
                  <option value="popularity-desc">{t("browse.sort.popularDesc")}</option>
                  <option value="rating-desc">{t("browse.sort.ratingDesc")}</option>
                  <option value="year-desc">{t("browse.sort.yearDesc")}</option>
                  <option value="year-asc">{t("browse.sort.yearAsc")}</option>
                  <option value="title-asc">{t("browse.sort.titleAsc")}</option>
                  <option value="title-desc">{t("browse.sort.titleDesc")}</option>
                </select>
                <ChevronDown
                  className={`absolute ${
                    isRTL ? "left-3" : "right-3"
                  } top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none`}
                />
              </div>
            </div>
          </motion.div>
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
            <div className="container mx-auto max-w-6xl px-4 py-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Enhanced Genres Filter */}
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                    {t("browse.filters.genres")}
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {genreOptions.map((genre) => (
                      <CustomCheckbox
                        key={genre}
                        checked={filters.genres.includes(genre)}
                        onChange={() => {
                          const newGenres = filters.genres.includes(genre)
                            ? filters.genres.filter((g) => g !== genre)
                            : [...filters.genres, genre];
                          handleFilterChange("genres", newGenres);
                        }}
                        label={t(`browse.genres.${genre.toLowerCase().replace(/\s+/g, "")}`)}
                      />
                    ))}
                  </div>
                </div>

                {/* Enhanced Type Filter */}
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-teal-600 rounded-full"></div>
                    {t("browse.filters.type")}
                  </h3>
                  <div className="space-y-2">
                    {typeOptions.map((type) => (
                      <CustomCheckbox
                        key={type}
                        checked={filters.types.includes(type)}
                        onChange={() => {
                          const newTypes = filters.types.includes(type)
                            ? filters.types.filter((t) => t !== type)
                            : [...filters.types, type];
                          handleFilterChange("types", newTypes);
                        }}
                        label={t(`browse.types.${type.toLowerCase()}`)}
                      />
                    ))}
                  </div>
                </div>

                {/* Enhanced Status Filter */}
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
                    {t("browse.filters.status")}
                  </h3>
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <CustomCheckbox
                        key={status}
                        checked={filters.status.includes(status)}
                        onChange={() => {
                          const newStatus = filters.status.includes(status)
                            ? filters.status.filter((s) => s !== status)
                            : [...filters.status, status];
                          handleFilterChange("status", newStatus);
                        }}
                        label={t(`browse.status.${status.toLowerCase().replace(/\s+/g, "")}`)}
                      />
                    ))}
                  </div>
                </div>

                {/* Enhanced Year and Rating Ranges */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                      {t("browse.filters.yearRange")}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="1990"
                          max={new Date().getFullYear()}
                          value={filters.year.min}
                          onChange={(e) =>
                            handleFilterChange("year", {
                              ...filters.year,
                              min: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder={t("browse.filters.minYear")}
                        />
                      </div>
                      <span className="text-neutral-400 font-medium">{t("browse.filters.to")}</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          min="1990"
                          max={new Date().getFullYear()}
                          value={filters.year.max}
                          onChange={(e) =>
                            handleFilterChange("year", {
                              ...filters.year,
                              max: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder={t("browse.filters.maxYear")}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full"></div>
                      {t("browse.filters.ratingRange")}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={filters.rating.min}
                          onChange={(e) =>
                            handleFilterChange("rating", {
                              ...filters.rating,
                              min: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder={t("browse.filters.minRating")}
                        />
                      </div>
                      <span className="text-neutral-400 font-medium">{t("browse.filters.to")}</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={filters.rating.max}
                          onChange={(e) =>
                            handleFilterChange("rating", {
                              ...filters.rating,
                              max: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder={t("browse.filters.maxRating")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <div className="container mx-auto max-w-6xl px-4 pb-16">
        {/* Enhanced Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {searchQuery
                ? t("browse.searchResults", { query: searchQuery })
                : t("browse.popularAnime")}
            </h2>
            <p className="text-neutral-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t("browse.resultsFound", { count: totalResults })}
            </p>
          </div>
        </motion.div>

        {/* Enhanced Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-700 border-t-blue-500 shadow-lg"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-transparent border-t-purple-500 opacity-30"></div>
            </div>
            <p className="text-neutral-400 mt-4 animate-pulse">{t("browse.loading")}</p>
          </motion.div>
        )}

        {/* Results Grid/List */}
        {!isLoading && (
          <>
            {searchResults.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                    : "space-y-4"
                }`}
              >
                {searchResults.map((anime, index) =>
                  viewMode === "grid" ? (
                    <motion.div
                      key={anime.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <AnimeCard show={anime} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={anime.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center space-x-4 p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-neutral-800 hover:border-neutral-600 hover:bg-black/50 transition-all duration-200 group"
                    >
                      <div className="flex-shrink-0 w-16 h-20 relative overflow-hidden rounded-lg shadow-lg">
                        <Image
                          src={anime.image}
                          alt={anime.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/anime/${anime.id}`} className="block">
                          <h3 className="text-lg font-medium text-white hover:text-blue-400 transition-colors truncate mb-1">
                            {anime.title}
                          </h3>
                          <div className="flex items-center space-x-4 mb-2 text-sm text-neutral-400">
                            <span className="bg-neutral-800 px-2 py-1 rounded-md">
                              {anime.type}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {anime.duration}
                            </span>
                            <span className="flex items-center">
                              <TvIcon className="w-3 h-3 mr-1" />
                              {anime.sub}
                            </span>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  )
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24"
              >
                <div className="text-8xl mb-6 opacity-50">🔍</div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {t("browse.noResults.title")}
                </h3>
                <p className="text-neutral-400 text-lg">{t("browse.noResults.description")}</p>
              </motion.div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center space-x-2 mt-16"
              >
                {/* Previous button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-6 py-3 bg-black/50 backdrop-blur-sm text-white rounded-xl border border-neutral-700 hover:border-neutral-500 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  <ChevronDown className={`w-4 h-4 ${isRTL ? "rotate-90" : "-rotate-90"}`} />
                  {t("browse.pagination.previous")}
                </motion.button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-12 h-12 rounded-xl border transition-all duration-200 font-medium ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                            : "bg-black/50 backdrop-blur-sm border-neutral-700 text-white hover:border-neutral-500 hover:bg-black/70"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-6 py-3 bg-black/50 backdrop-blur-sm text-white rounded-xl border border-neutral-700 hover:border-neutral-500 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {t("browse.pagination.next")}
                  <ChevronDown className={`w-4 h-4 ${isRTL ? "-rotate-90" : "rotate-90"}`} />
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(38, 38, 38, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

const BrowsePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowsePageClient />
    </Suspense>
  );
};

export default BrowsePage;
