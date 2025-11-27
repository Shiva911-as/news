import React, { useEffect, useState } from 'react';
import { X, Share2, Bookmark, ExternalLink, Sparkles, Search } from 'lucide-react';
import { Article } from '../types';

interface ArticleDetailProps {
  article: Article;
  onClose: () => void;
  onAskAI: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onClose, onAskAI }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Small delay to ensure CSS transition triggers
    requestAnimationFrame(() => setIsVisible(true));
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleShare = async () => {
    const shareUrl = article.url || window.location.href;
    const shareData = {
      title: article.title,
      text: article.summary,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignore abort errors (user cancelled share)
        if ((err as Error).name !== 'AbortError') {
            console.error('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Modal Content - Slide Up Animation */}
      <div 
        className={`relative w-full h-full md:h-[95vh] md:max-w-4xl bg-[#0e0e10] md:rounded-xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-[0.98]'
        }`}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-[#0e0e10]/95 backdrop-blur z-20 sticky top-0">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Source</span>
                <span className="text-zinc-200 font-bold text-sm tracking-tight">{article.source}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Fallback Search Button */}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(article.title + " " + article.source)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wide rounded transition-colors"
              title="Search on Google"
            >
              <Search size={14} />
              <span>Search</span>
            </a>

            {article.url && (
              <a 
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 md:px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wide rounded transition-colors"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">Visit Website</span>
                <span className="sm:hidden">Visit</span>
              </a>
            )}

             <button 
              onClick={onAskAI}
              className="group relative flex items-center gap-2 px-3 py-2 md:px-5 bg-green-500 hover:bg-green-400 text-black text-xs md:text-sm font-bold rounded overflow-hidden transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Sparkles size={16} className="fill-black relative z-10" />
              <span className="relative z-10 tracking-wide uppercase hidden sm:inline">AI Analyze</span>
              <span className="relative z-10 tracking-wide uppercase sm:hidden">Analyze</span>
            </button>
            
            <div className="h-6 w-px bg-zinc-800 mx-1" />
            
            <div className="flex items-center gap-1">
               <button 
                  onClick={handleShare}
                  className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800 relative"
                  title="Share"
                >
                  <Share2 size={20} />
                  {showCopied && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap animate-bounce">
                      Link Copied!
                    </span>
                  )}
               </button>
               <button onClick={handleClose} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800 ml-1">
                  <X size={20} />
               </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0e0e10]">
          <div className="max-w-3xl mx-auto p-8 md:p-12">
            
            {/* Hero Section */}
            <div className="flex flex-col gap-6 mb-10">
               <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-bold rounded uppercase tracking-wider">
                    {article.source}
                  </span>
                  <span className="text-zinc-500 text-xs font-mono">{article.publishedTime}</span>
               </div>
               <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                 {article.title}
               </h1>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-zinc max-w-none">
               <p className="text-lg text-zinc-300 leading-relaxed">
                 {article.fullContent || article.summary}
               </p>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-600 font-mono">
               <span>Generated by NewsHub Intelligence Engine</span>
               <span>{new Date().toISOString()}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};