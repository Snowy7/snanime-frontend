'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, ExternalLink } from 'lucide-react';
import { NewsContent } from '@/services/news';
import { useLanguage } from '@/context/LanguageContext';

interface NewsDetailProps {
  newsContent: NewsContent;
  newsUrl: string;
  onBack: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ newsContent, newsUrl, onBack }) => {
  const { t, getDirection } = useLanguage();
  return (
    <motion.article
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-black/30 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl overflow-hidden"
      dir={getDirection()}
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-800">
        <button
          onClick={onBack}
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-4 px-3 py-1.5 rounded-lg hover:bg-neutral-800/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('newsPage.backToList')}
        </button>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
          {newsContent.title}
        </h1>
        {newsContent.content && (
          <p className="text-lg text-neutral-300 leading-relaxed">
            {newsContent.content}
          </p>
        )}
      </div>

      {/* Images */}
      {newsContent.images && newsContent.images.length > 0 && (
        <div className="px-6 py-4">
          <div className="grid gap-4">
            {newsContent.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`News image ${index + 1}`}
                  className="w-full h-auto rounded-lg shadow-xl border border-neutral-700"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {newsContent.content && newsContent.content !== "Full article content available at the source." && (
          <div className="text-neutral-300 leading-relaxed mb-6">
            <div className="whitespace-pre-line">
              {newsContent.content}
            </div>
          </div>
        )}
        
        {/* Read Full Article Button */}
        <div className="mt-8 pt-6 border-t border-neutral-800">
          <a
            href={newsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('newsPage.readFull')}
          </a>
        </div>
      </div>
    </motion.article>
  );
};

export default NewsDetail;
