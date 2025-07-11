import React, { Dispatch, SetStateAction } from "react";
import { Filter, X, LayoutGrid, List, ChevronDown } from "lucide-react";
import { AnimeSort } from "@/types/anime";
import { FilterState } from "./types";

interface FilterControlsProps {
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  isFilterApplied: boolean;
  clearFilters: () => void;
  filters: FilterState;
  onFilterChange: (key: string, value: any) => void;
  SORT_OPTIONS: { value: AnimeSort; label: string }[];
  viewMode: "grid" | "list";
  setViewMode: Dispatch<SetStateAction<"grid" | "list">>;
}

export default function FilterControls({
  showFilters,
  setShowFilters,
  isFilterApplied,
  clearFilters,
  filters,
  onFilterChange,
  SORT_OPTIONS,
  viewMode,
  setViewMode,
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          showFilters
            ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
            : "bg-neutral-900/50 border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800/50"
        }`}
      >
        <Filter className="w-3.5 h-3.5" />
        Filters
      </button>

      {/* Clear Filters Button */}
      {isFilterApplied && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all duration-200"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}

      {/* Sort Dropdown */}
      <div className="relative">
        <select
          value={filters.sort[0]}
          onChange={(e) => onFilterChange("sort", [e.target.value as AnimeSort, "POPULARITY_DESC"])}
          className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm bg-neutral-900/80 border border-neutral-800 text-neutral-200 hover:bg-neutral-800/80 focus:outline-none transition-all duration-200"
          style={{
            backgroundImage: 'none'
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              className="bg-neutral-900 text-neutral-200 py-1"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900/50 overflow-hidden ml-auto">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-1.5 transition-all duration-200 ${
            viewMode === "grid"
              ? "bg-neutral-800 text-neutral-200"
              : "text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-1.5 transition-all duration-200 ${
            viewMode === "list"
              ? "bg-neutral-800 text-neutral-200"
              : "text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50"
          }`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 