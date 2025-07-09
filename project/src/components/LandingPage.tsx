import React from 'react';
import { Bot, ArrowRight, Zap, Users, Shield, Star, CheckCircle, Play } from 'lucide-react';
import { Button } from './Button';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenUserHistory: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onOpenUserHistory,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Intervu.<span className="text-blue-600">AI</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Features
            </a>
            <button
              onClick={onOpenUserHistory}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              My Interview Archive
            </button>
            <Button variant="ghost" onClick={onSignIn} className="font-medium">
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-12">
          {/* Trust Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 rounded-full text-sm font-semibold shadow-lg">
            <Zap className="w-4 h-4 mr-2 text-yellow-600" />
            Kickstart your interview prep
          </div>
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
              Land your{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                dream job
              </span>
              <br />
              with AI
            </h1>
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Practice interview questions and get real-time feedback to boost your confidence and land that perfect role.
            </p>
          </div>
          {/* CTA Section */}
          <div className="flex flex-col items-center space-y-6">
            <Button
              size="lg"
              onClick={onGetStarted}
              icon={ArrowRight}
              iconPosition="right"
              className="text-xl px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200"
            >
              Get Started Free
            </Button>
          </div>
        </div>
        {/* Why Choose Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-blue-600">Intervu.AI</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation with personalized feedback
            </p>
          </div>
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-green-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Real-time AI Feedback</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Get instant analysis of your responses with actionable insights to improve your performance and communication skills.
              </p>
            </div>
            <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Personalized Questions</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                AI generates custom questions based on your resume, job description, and target company for realistic practice.
              </p>
            </div>
            <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Confidence Building</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Practice in a safe environment and build the confidence you need to ace any interview with detailed progress tracking.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
