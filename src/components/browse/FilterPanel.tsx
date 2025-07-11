import React from "react";
import { motion } from "framer-motion";
import { AnimeFormat, AnimeSeason, AnimeStatus } from "@/types/anime";
import { FilterState } from "./types";
import { ChevronDown } from "lucide-react";

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (key: string, value: any) => void;
  FORMATS: AnimeFormat[];
  SEASONS: AnimeSeason[];
  STATUSES: AnimeStatus[];
  GENRES: string[];
}

export default function FilterPanel({
  filters,
  onFilterChange,
  FORMATS,
  SEASONS,
  STATUSES,
  GENRES,
}: FilterPanelProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto max-w-6xl py-4 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Format Section */}
        <div>
          <h3 className="text-sm font-medium text-neutral-300 mb-2">Format</h3>
          <div className="flex flex-wrap gap-1.5">
            {FORMATS.map((format) => (
              <button
                key={format}
                onClick={() => {
                  const newFormats = filters.format.includes(format)
                    ? filters.format.filter((f) => f !== format)
                    : [...filters.format, format];
                  onFilterChange("format", newFormats);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  filters.format.includes(format)
                    ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                    : "bg-neutral-900/50 border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800/50"
                }`}
              >
                {format.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Status Section */}
        <div>
          <h3 className="text-sm font-medium text-neutral-300 mb-2">Status</h3>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => onFilterChange("status", filters.status === status ? undefined : status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  filters.status === status
                    ? "bg-purple-500/20 border border-purple-500/50 text-purple-400"
                    : "bg-neutral-900/50 border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800/50"
                }`}
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Season Section */}
        <div>
          <h3 className="text-sm font-medium text-neutral-300 mb-2">Season</h3>
          <div className="flex flex-wrap gap-1.5">
            {SEASONS.map((season) => (
              <button
                key={season}
                onClick={() => onFilterChange("season", filters.season === season ? undefined : season)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  filters.season === season
                    ? "bg-green-500/20 border border-green-500/50 text-green-400"
                    : "bg-neutral-900/50 border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800/50"
                }`}
              >
                {season}
              </button>
            ))}
            <div className="relative">
              <select
                value={filters.seasonYear || ""}
                onChange={(e) => onFilterChange("seasonYear", e.target.value ? parseInt(e.target.value) : undefined)}
                className="appearance-none pl-3 pr-8 py-1 rounded-lg text-xs bg-neutral-900/80 border border-neutral-800 text-neutral-200 hover:bg-neutral-800/80 focus:outline-none transition-all duration-200"
                style={{
                  backgroundImage: 'none'
                }}
              >
                <option value="">Year</option>
                {years.map((year) => (
                  <option 
                    key={year} 
                    value={year}
                    className="bg-neutral-900 text-neutral-200 py-1"
                  >
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Genres Section */}
        <div>
          <h3 className="text-sm font-medium text-neutral-300 mb-2">Genres</h3>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  const newGenres = filters.genres.includes(genre)
                    ? filters.genres.filter((g) => g !== genre)
                    : [...filters.genres, genre];
                  onFilterChange("genres", newGenres);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  filters.genres.includes(genre)
                    ? "bg-red-500/20 border border-red-500/50 text-red-400"
                    : "bg-neutral-900/50 border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800/50"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 