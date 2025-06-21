'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, ExternalLink } from 'lucide-react';
import { NewsItem } from '@/services/news';
import { useLanguage } from '@/context/LanguageContext';

interface NewsCardProps {
  newsItem: NewsItem;
  onClick?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, onClick }) => {
  const { t, getDirection } = useLanguage();

  const formatDate = (pubDate: string) => {
    try {
      const date = new Date(pubDate);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return pubDate;
    }
  };

  const extractExcerpt = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-black/30 backdrop-blur-sm rounded-xl border border-neutral-800 hover:border-neutral-600 hover:bg-black/50 transition-all duration-300 overflow-hidden group cursor-pointer shadow-lg"
      onClick={onClick}
      dir={getDirection()}
    >
      <div className="p-6">
        {/* Categories */}
        {newsItem.category && newsItem.category.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {newsItem.category.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-400/30 text-blue-300"
              >
                <Tag className="w-3 h-3 mr-1" />
                {category}
              </span>
            ))}
            {newsItem.category.length > 2 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800/50 border border-neutral-700 text-neutral-400">
                +{newsItem.category.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {newsItem.title}
        </h3>

        {/* Description */}
        <p className="text-neutral-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {extractExcerpt(newsItem.description)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-neutral-500">
            <Calendar className="w-4 h-4 mr-1" />
            <time dateTime={newsItem.pubDate}>
              {formatDate(newsItem.pubDate)}
            </time>
          </div>
          
          <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
            {t('newsPage.readMore')}
            <ExternalLink className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default NewsCard;
