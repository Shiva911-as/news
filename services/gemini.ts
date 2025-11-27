import { GoogleGenAI } from "@google/genai";
import { Article, ChatMessage } from "../types";

// Safe API Key retrieval for both Local (Vite) and Cloud environments
const getApiKey = () => {
  // 1. Check Vite/Local environment
  // @ts-ignore: import.meta is available in Vite
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  
  // 2. Check Standard/Cloud environment
  // Check if process is defined to avoid ReferenceError in browsers that don't polyfill it
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  
  return '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const NEWS_SYSTEM_INSTRUCTION = `
You are a real-time news aggregator API. Your goal is to find the latest and most relevant news for the Indian audience based on the requested category.
When asked for news, use Google Search to find real articles.
ALWAYS output the result as a strictly valid JSON array string (no markdown formatting around it).
Each object in the array must strictly follow this schema:
{
  "id": "unique_string_id",
  "title": "Article Headline",
  "summary": "Short summary (1 sentence)",
  "source": "Publisher Name",
  "publishedTime": "Relative time (e.g. '2 hours ago')",
  "url": "The exact URL found in search results. Do NOT fabricate or guess URL paths. If a direct link is unavailable or uncertain, provide a 'https://www.google.com/search?q=' URL for the headline.",
  "fullContent": "A concise overview of the news story (max 100 words).",
  "impact": "One sentence explaining the significance."
}
`;

// --- Cache Implementation ---
interface CacheEntry {
  timestamp: number;
  data: Article[];
}

const STORAGE_KEY_CACHE = 'newsHub_api_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const activeRequests = new Map<string, Promise<Article[]>>();

// Load cache from localStorage on init
let newsCache: Map<string, CacheEntry> = new Map();
try {
  const stored = localStorage.getItem(STORAGE_KEY_CACHE);
  if (stored) {
    const parsedObj = JSON.parse(stored);
    Object.entries(parsedObj).forEach(([key, value]) => {
      const entry = value as CacheEntry;
      // Only keep valid cache entries
      if (Date.now() - entry.timestamp < CACHE_DURATION) {
        newsCache.set(key, entry);
      }
    });
  }
} catch (e) {
  console.warn('Failed to load news cache', e);
}

const saveCacheToStorage = () => {
  try {
    const obj = Object.fromEntries(newsCache);
    localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(obj));
  } catch (e) {
    console.warn('Failed to save news cache', e);
  }
};

export const fetchNewsByCategory = async (category: string, excludeTitles: string[] = []): Promise<Article[]> => {
  // 1. Determine if this is an initial load or a pagination load
  const isInitialLoad = excludeTitles.length === 0;
  const cacheKey = `news_${category}`;

  // 2. Check Cache (Only serve cache on initial load to ensure freshness for pagination)
  if (isInitialLoad) {
    const cached = newsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.debug(`[Cache Hit] Serving ${category}`);
      return cached.data;
    }
  }

  // 3. Request Deduplication
  // Create a unique key for the current request state
  const requestKey = `${category}_${excludeTitles.length}`;
  if (activeRequests.has(requestKey)) {
    console.debug(`[Dedup] Reusing in-flight request for ${requestKey}`);
    return activeRequests.get(requestKey)!;
  }

  // 4. Define API Request
  const fetchPromise = (async () => {
    try {
      const searchTopic = category === 'For You' 
        ? 'a diverse mix of high-impact headlines across Technology, Business, and Politics' 
        : category;

      const recentExcludes = excludeTitles.slice(-10);
      const excludePrompt = recentExcludes.length > 0 
        ? `Ensure the articles are distinct and NOT about the following headlines: ${JSON.stringify(recentExcludes)}.` 
        : '';

      const prompt = `Find 4 distinct latest news articles strictly about ${searchTopic} in India. Ensure they are recent (last 24 hours). ${excludePrompt} Return ONLY the JSON array.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: NEWS_SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
        }
      });

      const text = response.text || "[]";
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      let parsed: Article[] = [];
      
      try {
        parsed = JSON.parse(cleanText);
        parsed = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse news JSON", e, cleanText);
      }

      // 5. Update Cache (Only on initial load)
      if (isInitialLoad && parsed.length > 0) {
        newsCache.set(cacheKey, {
          timestamp: Date.now(),
          data: parsed
        });
        saveCacheToStorage();
      }

      return parsed;
    } catch (error) {
      console.error("Gemini News Fetch Error:", error);
      return [];
    } finally {
      activeRequests.delete(requestKey);
    }
  })();

  activeRequests.set(requestKey, fetchPromise);
  return fetchPromise;
};

export const chatWithGemini = async (
  messages: ChatMessage[], 
  context?: Article
): Promise<string> => {
  try {
    let systemInstruction = "You are a helpful, concise AI news assistant. Answer questions based on general knowledge or the specific article provided.";
    
    if (context) {
      systemInstruction += `\n\nCurrent Article Context:\nTitle: ${context.title}\nContent: ${context.fullContent}\nImpact: ${context.impact}`;
    }

    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const lastMessage = messages[messages.length - 1].text;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
      history: history
    });

    const result = await chat.sendMessage({ message: lastMessage });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};