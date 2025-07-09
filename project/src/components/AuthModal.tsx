import React, { useState } from 'react';
import { Bot, Mail, Eye, EyeOff, X } from 'lucide-react';
import { Button } from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  onAuthenticate: (email: string, name: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onModeChange,
  onAuthenticate
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthenticate(email, name || email.split('@')[0]);
  };

  const handleGoogleSignIn = () => {
    onAuthenticate('demo@example.com', 'Demo User');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-0">
        {/* Header */}
        <div className="relative flex flex-col items-center pt-6 pb-3 px-5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-3">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">Welcome to Intervu.AI</h2>
          <p className="text-gray-600 mt-1 text-sm text-center">Start your interview practice journey</p>
          {/* Tabs */}
          <div className="flex w-full mt-4 bg-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => onModeChange('signup')}
              className={`flex-1 py-2 text-sm font-semibold transition-all duration-150 ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 shadow font-bold'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => onModeChange('signin')}
              className={`flex-1 py-2 text-sm font-semibold transition-all duration-150 ${
                mode === 'signin'
                  ? 'bg-white text-blue-600 shadow font-bold'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 pt-2">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full py-3 mb-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-base font-semibold transition-all duration-200"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
              style={{ marginLeft: "-6px" }}
            />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center mb-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs text-gray-400 font-medium tracking-wide">
              OR CONTINUE WITH EMAIL
            </span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 mt-1 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-none"
              icon={Mail}
            >
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};
