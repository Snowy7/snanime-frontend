"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SnAnimeService } from "@/services/snanime";
import { useLanguage } from "@/context/LanguageContext";

interface SearchDropdownProps {
  isExpanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}

interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
}

interface QuickResult {
  id: string;
  title: string;
  posterUrl: string;
  type: string;
  year: number;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ isExpanded, onToggle, onClose }) => {
  const { t, getDirection } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<QuickResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState<string[]>(["Attack on Titan", "Demon Slayer", "One Piece", "Naruto", "Jujutsu Kaisen", "My Hero Academia"]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const snAnimeService = SnAnimeService.getInstance();

  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      const history: SearchHistory[] = JSON.parse(savedHistory);
      setSearchHistory(history);
      setRecentSearches(history.slice(0, 5).map((item) => item.query));
    }
  }, []);

  useEffect(() => {
    // Save search history to localStorage
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await snAnimeService.searchAnime(query, 1, 6);
      const quickResults: QuickResult[] = results.items.map((anime) => ({
        id: anime.id,
        title: anime.title,
        posterUrl: anime.posterUrl,
        type: anime.type,
        year: anime.year || new Date().getFullYear(),
      }));
      setSearchResults(quickResults);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // unfocus input
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }

    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
      // Navigate to full search page
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const addToSearchHistory = (query: string) => {
    const newHistoryItem: SearchHistory = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
    };

    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
      return [newHistoryItem, ...filtered].slice(0, 10); // Keep only 10 items
    });
  };

  const handleQuickSearch = (query: string) => {
    addToSearchHistory(query);
    setSearchQuery(query);
    window.location.href = `/browse?search=${encodeURIComponent(query)}`;
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    setRecentSearches([]);
  };

  const removeFromHistory = (id: string) => {
    setSearchHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, onClose]);

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`p-2.5 rounded-full bg-black/20 backdrop-blur-md text-white border-t border-white/30 hover:bg-black/80 hover:scale-105 transition-all duration-300 ${
          isExpanded ? "!bg-black/80 !text-white" : "text-neutral-300 hover:text-white"
        }`}
      >
        <Search className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
            animate={{ width: 320, opacity: 1, marginLeft: 8 }}
            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-visible"
          >
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search anime..."
                  className="h-10 w-full bg-black/50 text-white rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 border border-white/20 placeholder-neutral-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className={`absolute ${getDirection() === "rtl" ? "left-3" : "left-3"} p-1 text-neutral-400 hover:text-white transition-colors`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Search Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-800/50 overflow-hidden z-50 max-h-96 overflow-y-auto"
              >
                {/* Search Results */}
                {searchQuery && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white">Search Results</h3>
                      {searchQuery && (
                        <Link
                          href={`/browse?search=${encodeURIComponent(searchQuery)}`}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={() => addToSearchHistory(searchQuery)}
                        >
                          View all results
                        </Link>
                      )}
                    </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map((anime) => (
                          <Link
                            key={anime.id}
                            href={`/anime/${anime.id}`}
                            onClick={() => addToSearchHistory(searchQuery)}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors group"
                          >
                            <div className="flex-shrink-0 w-12 h-16 relative overflow-hidden rounded-md">
                              <Image src={anime.posterUrl} alt={anime.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white group-hover:text-blue-400 truncate transition-colors">{anime.title}</h4>
                              <p className="text-xs text-neutral-400">
                                {anime.type} • {anime.year}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : searchQuery.length > 2 && !isLoading ? (
                      <div className="py-8 text-center">
                        <p className="text-neutral-400 text-sm">No results found for "{searchQuery}"</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Recent Searches */}
                {!searchQuery && recentSearches.length > 0 && (
                  <div className="p-4 border-t border-neutral-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-white flex items-center">
                        <Clock className="w-4 h-4 mx-2" />
                        {t("Recent Searches")}
                      </h3>
                      <button onClick={clearSearchHistory} className="text-xs text-neutral-400 hover:text-white transition-colors">
                        {t("Clear")}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => {
                        const historyItem = searchHistory.find((item) => item.query === search);
                        return (
                          <div key={index} className="flex items-center justify-between group">
                            <button
                              onClick={() => handleQuickSearch(search)}
                              className="flex-1 text-left text-sm text-neutral-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-neutral-800/50"
                            >
                              {search}
                            </button>
                            {historyItem && (
                              <button onClick={() => removeFromHistory(historyItem.id)} className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white transition-all">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                {!searchQuery && (
                  <div className="p-4 border-t border-neutral-800/50">
                    <h3 className="text-sm font-medium text-white flex items-center mb-3">
                      <TrendingUp className="w-4 h-4 mx-2" />
                      {t("Trending")}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {trendingSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSearch(search)}
                          className="text-left text-sm text-neutral-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-neutral-800/50 truncate"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchDropdown;
