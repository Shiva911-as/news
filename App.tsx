import React, { useState, useEffect } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { NewsGrid } from './components/NewsGrid';
import { ArticleDetail } from './components/ArticleDetail';
import { AIChat } from './components/AIChat';
import { Auth } from './components/Auth';
import { fetchNewsByCategory } from './services/gemini';
import { Category, Article, User } from './types';
import { AuthService } from './services/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('For You');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Check for persisted session on mount
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Fetch news when user is authenticated and category changes
  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;

    const loadInitialNews = async () => {
      setIsLoading(true);
      setArticles([]); // Clear view for loading state
      
      try {
        // Deduping and caching is handled inside fetchNewsByCategory
        const data = await fetchNewsByCategory(activeCategory, []);
        if (isMounted) {
          setArticles(data);
        }
      } catch (error) {
        console.error("Failed to load news", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    loadInitialNews();
    
    return () => {
      isMounted = false;
    };
  }, [activeCategory, user]);

  const handleLoadMore = async () => {
    if (isLoading || isLoadingMore || !user) return;

    setIsLoadingMore(true);
    // Pass existing titles to exclude them from the new batch
    const existingTitles = articles.map(a => a.title);
    
    try {
      const newArticles = await fetchNewsByCategory(activeCategory, existingTitles);
      
      // Append new articles, filtering out any accidental duplicates based on Title
      setArticles(prev => {
        const currentTitles = new Set(prev.map(a => a.title));
        const distinctNew = newArticles.filter(a => !currentTitles.has(a.title));
        return [...prev, ...distinctNew];
      });
    } catch (error) {
      console.error("Failed to load more news", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setArticles([]);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden font-sans selection:bg-green-500/30">
      
      <Sidebar 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative transition-all duration-300 md:ml-72">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="text-zinc-400">
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg tracking-tight flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            NewsHub
          </span>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-8 h-8 rounded bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500"
          >
            <Sparkles size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative">
           <NewsGrid 
             articles={articles} 
             isLoading={isLoading} 
             isLoadingMore={isLoadingMore}
             category={activeCategory}
             onArticleClick={setSelectedArticle}
             onLoadMore={handleLoadMore}
           />
        </div>
      </main>

      {/* Floating Action Button for AI (Desktop) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 hidden md:flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-zinc-800 hover:border-green-500/50 transition-all transform hover:translate-y-[-2px] z-30 group"
        >
          <Sparkles size={18} className="text-green-500 group-hover:text-green-400" />
          <span className="font-bold text-sm tracking-wide">AI ASSISTANT</span>
        </button>
      )}

      {/* Detail Overlay */}
      {selectedArticle && (
        <ArticleDetail 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)}
          onAskAI={() => setIsChatOpen(true)}
        />
      )}

      {/* AI Chat Sidebar */}
      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        context={selectedArticle}
      />
    </div>
  );
};

export default App;