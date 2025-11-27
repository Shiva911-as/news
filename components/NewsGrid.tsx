import React, { useRef, useEffect, useCallback } from 'react';
import { NewsCard } from './NewsCard';
import { Article } from '../types';
import { Loader2 } from 'lucide-react';

interface NewsGridProps {
  articles: Article[];
  isLoading: boolean;
  isLoadingMore: boolean;
  onArticleClick: (article: Article) => void;
  onLoadMore: () => void;
  category: string;
}

export const NewsGrid: React.FC<NewsGridProps> = ({ 
  articles, 
  isLoading, 
  isLoadingMore,
  onArticleClick, 
  onLoadMore,
  category 
}) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && articles.length > 0) {
        onLoadMore();
      }
    }, { threshold: 0.1 }); // Trigger when 10% visible

    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, onLoadMore, articles.length]);

  if (isLoading && articles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
        <p className="text-zinc-500 text-sm animate-pulse font-medium tracking-wide">SCANNING SOURCES...</p>
      </div>
    );
  }

  if (articles.length === 0 && !isLoading) {
     return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-zinc-500">
        <p>No intelligence found for this sector.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{category}</h2>
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Intelligence Feed
          </div>
        </div>
        <div className="text-right hidden sm:block">
           <span className="text-2xl font-bold text-zinc-200">{articles.length}</span>
           <p className="text-xs text-zinc-600 uppercase">Articles</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {articles.map((article, index) => (
          <div 
            key={`${article.id}-${index}`}
            className="w-full"
            style={{ 
              animation: `slideUp 0.4s ease-out forwards`,
              // Stagger animation based on modulo to ensure appended items animate nicely without long delays
              animationDelay: `${(index % 4) * 50}ms`, 
              opacity: 0,
              transform: 'translateY(10px)'
            }}
          >
            <NewsCard article={article} onClick={onArticleClick} />
          </div>
        ))}
      </div>

      {/* Infinite Scroll Sentinel & Loader */}
      <div ref={lastElementRef} className="py-8 flex justify-center w-full">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin text-green-500" />
            <span className="text-xs font-mono animate-pulse">FETCHING MORE INTELLIGENCE...</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};