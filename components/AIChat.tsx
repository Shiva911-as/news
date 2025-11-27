import React, { useRef, useEffect, useState } from 'react';
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage, Article } from '../types';
import { chatWithGemini } from '../services/gemini';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  context?: Article | null;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, context }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "System Online. I am your news assistant. How can I help you analyze the latest stories?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Suggestion chips based on context
  const suggestions = context 
    ? ["Summarize this", "Why is this important?", "Related topics"]
    : ["Latest headlines", "Tech trends", "Sports update"];

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithGemini([...messages, userMsg], context || undefined);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-[#0c0c0e] border-l border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Sparkles size={16} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-sm tracking-wide">AI ASSISTANT</h3>
              <p className="text-[10px] text-zinc-500 font-mono">GEMINI-2.5-FLASH // ACTIVE</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div 
                className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 border ${msg.role === 'user' ? 'bg-zinc-800 border-zinc-700' : 'bg-green-900/20 border-green-500/30'}`}
              >
                {msg.role === 'user' ? <User size={14} className="text-zinc-400" /> : <Bot size={14} className="text-green-500" />}
              </div>
              <div 
                className={`max-w-[85%] p-3 text-sm leading-relaxed rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-zinc-800 text-zinc-100' 
                    : 'text-zinc-300'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
               <div className="w-7 h-7 rounded bg-green-900/20 border border-green-500/30 flex items-center justify-center">
                 <Bot size={14} className="text-green-500" />
               </div>
               <div className="flex items-center gap-2 pt-1.5">
                 <Loader2 size={14} className="animate-spin text-green-500" />
                 <span className="text-xs text-green-500/70 font-mono animate-pulse">PROCESSING...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Context Indicator if an article is open */}
        {context && (
          <div className="px-4 py-2 bg-zinc-900/50 border-y border-zinc-800">
             <div className="flex items-center gap-2 text-xs text-zinc-500 truncate font-mono">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               CONTEXT: <span className="text-zinc-300 truncate">{context.title.substring(0, 30)}...</span>
             </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-zinc-900">
          {suggestions.map((s, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(s)}
              className="flex-shrink-0 px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:text-green-400 rounded text-[11px] text-zinc-500 transition-all whitespace-nowrap uppercase tracking-wide"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0c0c0e]">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full bg-[#18181b] border border-zinc-800 text-zinc-200 text-sm rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all placeholder:text-zinc-600"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-green-600 hover:bg-green-500 text-black rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};