import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Article } from '../types';

interface NewsCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  return (
    <div 
      className="group bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/50 cursor-pointer flex flex-col gap-4"
      onClick={() => onClick(article)}
    >
      {/* Meta Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">
          {article.source}
        </span>
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
           <Clock size={12} />
           <span>{article.publishedTime}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-zinc-100 leading-tight group-hover:text-white transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
          {article.summary}
        </p>
      </div>

      {/* Footer / Action */}
      <div className="mt-auto pt-2 flex items-center text-xs font-medium text-zinc-500 group-hover:text-green-400 transition-colors">
        <span>Read full story</span>
        <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};