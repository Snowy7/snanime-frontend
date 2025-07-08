
import { Metadata } from 'next';
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { newsService, NewsItem, NewsContent } from '@/services/news';
import NewsCard from '@/components/cards/NewsCard';
import NewsDetail from '@/components/NewsDetail';
import NewsFilters from '@/components/NewsFilters';
import Loading from '@/components/Loading';

export const metadata: Metadata = {
  title: 'Anime News',
  description: 'Stay up-to-date with the latest news in the anime world. Get updates on new releases, popular series, and industry events.',
};

const NewsPage: React.FC = () => {
  const { t, getDirection } = useLanguage();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsContent | null>(null);
  const [selectedNewsUrl, setSelectedNewsUrl] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load news on component mount
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const feeds = await newsService.getNewsFeeds();
      setNewsItems(feeds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  // Handle news item click
  const handleNewsClick = async (newsItem: NewsItem) => {
    try {
      setLoading(true);
      const content = await newsService.getNewsContent(newsItem.link);
      setSelectedNews(content);
      setSelectedNewsUrl(newsItem.link);
    } catch (err) {
      setError('Failed to load news content');
    } finally {
      setLoading(false);
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedNews(null);
    setSelectedNewsUrl('');
  };
  // Get unique categories
  const categories = useMemo(() => {
    return newsService.getUniqueCategories(newsItems);
  }, [newsItems]);

  // Filter and search news
  const filteredNews = useMemo(() => {
    let filtered = newsItems;

    // Filter by category
    if (selectedCategory) {
      filtered = newsService.filterByCategory(filtered, selectedCategory);
    }

    // Search
    if (searchTerm) {
      filtered = newsService.searchNews(filtered, searchTerm);
    }

    return filtered;
  }, [newsItems, selectedCategory, searchTerm]);
  // If showing news detail
  if (selectedNews) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <NewsDetail
            newsContent={selectedNews}
            newsUrl={selectedNewsUrl}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8" dir={getDirection()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('newsPage.title')}
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            {t('newsPage.subtitle')}
          </p>
        </motion.div>

        {/* Filters */}
        <NewsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loading />
            <span className="ml-3 text-neutral-300">
              {t('newsPage.loading')}
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/20 border border-red-800 rounded-xl p-6 mb-8 backdrop-blur-sm"
          >
            <div className="flex items-center mb-4">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <h3 className="text-lg font-medium text-red-200">
                {t('newsPage.error')}
              </h3>
            </div>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={loadNews}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('newsPage.retry')}
            </button>
          </motion.div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <>
            {filteredNews.length === 0 ? (              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-neutral-500 mb-4">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  {t('newsPage.noNews')}
                </h3>
                <p className="text-neutral-400">
                  {searchTerm || selectedCategory 
                    ? 'Try adjusting your search or filters'
                    : 'Check back later for updates'
                  }
                </p>
              </motion.div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-6">
                  <p className="text-sm text-neutral-400">
                    {filteredNews.length === newsItems.length 
                      ? `${filteredNews.length} articles`
                      : `${filteredNews.length} of ${newsItems.length} articles`
                    }
                  </p>
                </div>

                {/* News Grid */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredNews.map((newsItem, index) => (
                    <motion.div
                      key={newsItem.guid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <NewsCard
                        newsItem={newsItem}
                        onClick={() => handleNewsClick(newsItem)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
