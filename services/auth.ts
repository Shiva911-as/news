import { User } from '../types';

const STORAGE_KEY_USERS = 'newsHub_users';
const STORAGE_KEY_SESSION = 'newsHub_currentUser';

// Helper to generate a random avatar color
const getRandomColor = () => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const AuthService = {
  // Get all registered users from local storage
  getKnownUsers: (): User[] => {
    try {
      const users = localStorage.getItem(STORAGE_KEY_USERS);
      return users ? JSON.parse(users) : [];
    } catch (e) {
      return [];
    }
  },

  // Register a new user
  register: async (name: string, email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = AuthService.getKnownUsers();
    
    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      initial: name.charAt(0).toUpperCase(),
      color: getRandomColor(),
      password // storing plain text only for this local demo
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Auto login after register
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newUser));
    return newUser;
  },

  // Login an existing user
  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate login delay
    
    const users = AuthService.getKnownUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password && user.password !== password) {
      throw new Error('Invalid password');
    }

    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    return user;
  },

  // Get current session
  getCurrentUser: (): User | null => {
    try {
      const session = localStorage.getItem(STORAGE_KEY_SESSION);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }
};