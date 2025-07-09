import React, { useState } from 'react';
import { 
  Bot, 
  Calendar, 
  Clock, 
  Star, 
  Search,
  Eye,
  Download,
  RotateCcw,
  Palette,
  Settings,
  User
} from 'lucide-react';

// Type for navigation
type Page =
  | 'landing'
  | 'onboarding'
  | 'summary'
  | 'live-session'
  | 'report'
  | 'user-history';

// This is a flexible type for your interview history data
interface Interview {
  id: number | string;
  date: string;         // e.g. "2024-01-15"
  time: string;         // e.g. "14:30"
  role: string;
  company: string;
  score: number;
  status: string;       // "Completed", etc.
}

interface UserHistoryProps {
  onNavigate: (page: Page) => void;
  colorTheme: string;
  onThemeChange: (theme: string) => void;
  interviews: Interview[]; // REAL data passed from parent
}

const UserHistory: React.FC<UserHistoryProps> = ({ onNavigate, colorTheme, onThemeChange, interviews }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Unique roles/companies for filter dropdowns
  const uniqueRoles = Array.from(new Set(interviews.map(i => i.role)));
  const uniqueCompanies = Array.from(new Set(interviews.map(i => i.company)));

  const themes = [
    { name: 'blue', color: 'bg-blue-500' },
    { name: 'purple', color: 'bg-purple-500' },
    { name: 'green', color: 'bg-green-500' },
    { name: 'red', color: 'bg-red-500' },
    { name: 'orange', color: 'bg-orange-500' },
    { name: 'pink', color: 'bg-pink-500' }
  ];

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || interview.role === filterRole;
    const matchesCompany = !filterCompany || interview.company === filterCompany;
    return matchesSearch && matchesRole && matchesCompany;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      {/* Navigation */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">Intervu.AI</span>
          </div>
          <nav className="flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('landing')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </button>
            <button className="text-blue-600 font-medium">Archive</button>
            <button className="text-gray-600 hover:text-blue-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Palette className="w-5 h-5" />
              </button>
              {showThemeSelector && (
                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-10">
                  <p className="text-sm font-medium text-gray-700 mb-3">Choose Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {themes.map(theme => (
                      <button
                        key={theme.name}
                        onClick={() => {
                          onThemeChange(theme.name);
                          setShowThemeSelector(false);
                        }}
                        className={`w-8 h-8 rounded-full ${theme.color} hover:scale-110 transition-transform ${
                          colorTheme === theme.name ? 'ring-2 ring-gray-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </nav>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Interview Archive
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              All your past mock interviews, detailed feedback, and scores — always at your fingertips.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Companies</option>
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interview Cards */}
          {filteredInterviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInterviews.map(interview => (
                <div
                  key={interview.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{interview.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{interview.time}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {interview.role}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {interview.company}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">{interview.score}/10</span>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {interview.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onNavigate('report')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Report
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No mock interviews yet
              </h3>
              <p className="text-gray-600 mb-6">
                Ready to get started with your first interview practice?
              </p>
              <button
                onClick={() => onNavigate('onboarding')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start Your First Interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
