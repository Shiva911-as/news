import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/auth';
import { Loader2, ArrowRight, UserPlus, X, Lock, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'list' | 'email' | 'password' | 'register' | 'loading'>('list');
  const [users, setUsers] = useState<User[]>([]);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const knownUsers = AuthService.getKnownUsers();
    setUsers(knownUsers);
    if (knownUsers.length === 0) {
      setStep('email');
    }
  }, []);

  const handleUserSelect = (user: User) => {
    setEmail(user.email);
    setError(null);
    setPassword('');
    setStep('password');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      setStep('password');
    } else {
      setStep('register');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const user = await AuthService.login(email, password);
      setStep('loading');
      onLogin(user);
    } catch (err) {
      setError("Invalid password. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newUser = await AuthService.register(name, email, password);
      setStep('loading');
      onLogin(newUser);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    setError(null);
    setPassword('');
    if (step === 'password') {
      // If we have users in the list and we selected one, go back to list
      // If we typed an email manually, go back to email input
      if (users.find(u => u.email === email)) {
        setStep('list');
      } else {
        setStep('email');
      }
    } else if (step === 'register') {
      setStep('email');
    } else if (step === 'email') {
      setStep('list');
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
           <p className="text-zinc-400 text-sm font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-[420px] bg-[#202020] rounded-xl shadow-2xl border border-zinc-800 p-8 relative">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-transparent rounded-lg flex items-center justify-center mb-4">
             {/* Logo / Icon */}
             <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-200 font-bold text-xl border border-zinc-700">
               N
             </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 text-center">
            {step === 'list' ? 'Log in' : step === 'register' ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-zinc-400 text-sm mt-2 text-center">
            {step === 'list' && 'Choose an account to continue to NewsHub'}
            {step === 'email' && 'Enter your email to get started'}
            {step === 'password' && `Enter password for ${email}`}
            {step === 'register' && `Set up your profile for ${email}`}
          </p>
        </div>

        {/* Step: User List */}
        {step === 'list' && (
          <div className="space-y-2">
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar -mx-2 px-2">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-700/50 transition-colors text-left group"
                >
                  <div className={`w-10 h-10 rounded-full ${user.color || 'bg-blue-600'} flex items-center justify-center text-white font-medium text-sm shadow-md`}>
                    {user.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 font-medium truncate">{user.name}</p>
                    <p className="text-zinc-500 text-xs truncate group-hover:text-zinc-400">{user.email}</p>
                  </div>
                  <ArrowRight size={16} className="text-zinc-600 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
            
            <div className="h-px bg-zinc-800 my-4" />
            
            <button
              onClick={() => { setEmail(''); setStep('email'); }}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/30 transition-colors text-sm font-medium"
            >
              <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center">
                <UserPlus size={14} />
              </div>
              Use another account
            </button>
          </div>
        )}

        {/* Step: Email Input */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
             <div className="space-y-1">
               <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Email Address</label>
               <input 
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 autoFocus
                 className="w-full bg-[#151515] border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all placeholder:text-zinc-700"
                 placeholder="name@example.com"
               />
             </div>
             
             <button 
               type="submit" 
               disabled={!email.trim()}
               className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
             >
               Continue
               <ArrowRight size={16} />
             </button>
          </form>
        )}

        {/* Step: Password Input */}
        {step === 'password' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
             <div className="space-y-1">
               <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Password</label>
               <div className="relative">
                 <input 
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   autoFocus
                   className="w-full bg-[#151515] border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all placeholder:text-zinc-700"
                   placeholder="Enter your password"
                 />
                 <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                 >
                   {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
               </div>
             </div>
             
             {error && (
               <div className="text-red-400 text-xs bg-red-900/10 border border-red-900/20 p-2 rounded">
                 {error}
               </div>
             )}

             <button 
               type="submit" 
               disabled={!password || isSubmitting}
               className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
             >
               {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Log in'}
             </button>
          </form>
        )}

        {/* Step: Registration */}
        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
             <div className="space-y-1">
               <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Full Name</label>
               <input 
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 autoFocus
                 className="w-full bg-[#151515] border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all placeholder:text-zinc-700"
                 placeholder="Jane Doe"
               />
             </div>

             <div className="space-y-1">
               <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Set Password</label>
               <div className="relative">
                 <input 
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-[#151515] border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all placeholder:text-zinc-700"
                   placeholder="Create a strong password"
                 />
                 <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                 >
                   {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
               </div>
             </div>
             
             {error && (
               <div className="text-red-400 text-xs bg-red-900/10 border border-red-900/20 p-2 rounded">
                 {error}
               </div>
             )}
             
             <button 
               type="submit" 
               disabled={!name.trim() || !password || isSubmitting}
               className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
             >
               {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
             </button>
          </form>
        )}

        {/* Back Button Logic */}
        {step !== 'list' && (users.length > 0 || step !== 'email') && (
           <button 
             type="button" 
             onClick={goBack}
             className="w-full text-zinc-500 hover:text-zinc-300 text-xs mt-6 transition-colors"
           >
             ← Back
           </button>
        )}

      </div>
      
      {/* Footer */}
      <div className="fixed bottom-6 text-zinc-600 text-xs flex gap-6">
        <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
        <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
        <a href="#" className="hover:text-zinc-400 transition-colors">Contact Support</a>
      </div>
    </div>
  );
};