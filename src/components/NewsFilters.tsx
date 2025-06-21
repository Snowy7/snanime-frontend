'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface NewsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  showFilters: boolean;
  onToggleFilters: () => void;
}

const NewsFilters: React.FC<NewsFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  showFilters,
  onToggleFilters,
}) => {
  const { t, getDirection } = useLanguage();
  return (
    <div className="mb-8" dir={getDirection()}>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`${t('search')} ${t('newsPage.animeNews')}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/50 backdrop-blur-lg text-white rounded-xl border border-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-neutral-400 shadow-lg"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button
          onClick={onToggleFilters}
          className={`inline-flex items-center px-6 py-3 rounded-xl border transition-all duration-200 shadow-lg ${
            showFilters
              ? 'bg-gradient-to-r from-white/10 to-white/20 border-blue-500 text-white shadow-blue-500/25'
              : 'bg-black/50 backdrop-blur-sm border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-black/70'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          {t('browse.filters.title')}
        </button>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="bg-black/30 backdrop-blur-xl border border-neutral-800 rounded-xl p-6 shadow-2xl">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            {t('newsPage.categories')}
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onCategoryChange('')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-neutral-900/50 border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/70'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-neutral-900/50 border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/70'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsFilters;
