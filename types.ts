export interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedTime: string;
  fullContent: string;
  impact?: string;
  keyPoints?: string[];
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initial: string;
  color?: string; // For avatar background
  password?: string; // Stored locally for this demo
}

export type Category = 'For You' | 'Business' | 'Sports' | 'Technology' | 'Politics' | 'Entertainment';

export interface AIState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
}