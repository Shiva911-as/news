import React from 'react';
import { LayoutGrid, Briefcase, Trophy, Cpu, Vote, Film, X, LogOut, Sparkles } from 'lucide-react';
import { Category, User } from '../types';

interface SidebarProps {
  activeCategory: Category;
  onSelectCategory: (c: Category) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  user: User;
  onLogout: () => void;
}

const categories: { id: Category; icon: React.ReactNode }[] = [
  { id: 'For You', icon: <Sparkles size={20} /> },
  { id: 'Business', icon: <Briefcase size={20} /> },
  { id: 'Sports', icon: <Trophy size={20} /> },
  { id: 'Technology', icon: <Cpu size={20} /> },
  { id: 'Politics', icon: <Vote size={20} /> },
  { id: 'Entertainment', icon: <Film size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory, isOpen, toggleSidebar, user, onLogout }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <aside 
        className={`fixed top-0 left-0 h-screen w-72 bg-[#09090b] border-r border-zinc-900 flex flex-col z-30 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <span className="text-black font-bold text-lg">N</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">NewsHub</h1>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-4">Feeds</h2>
            <nav className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium border border-transparent
                    ${activeCategory === cat.id 
                      ? 'bg-zinc-900/80 text-green-400 border-zinc-800/50 shadow-inner' 
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                >
                  <span className={`${activeCategory === cat.id ? 'text-green-500' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors`}>
                    {cat.icon}
                  </span>
                  {cat.id}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-900 bg-[#0c0c0e]">
           <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-default group">
             <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
               {user.initial}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm text-zinc-200 font-medium truncate">{user.name}</p>
               <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
             </div>
             <button 
               onClick={onLogout}
               className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
               title="Sign Out"
             >
               <LogOut size={14} />
             </button>
           </div>
        </div>
      </aside>
    </>
  );
};