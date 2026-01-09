import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search, Code, BookOpen, CheckCircle, TrendingUp, Flame,
  ChevronRight, Trophy, Target, Clock, X, Check
} from 'lucide-react';

const Progress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('mcq'); // 'mcq' | 'coding'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progressRes, leaderboardRes] = await Promise.all([
        api.get('/progress/me'),
        api.get('/progress/leaderboard?limit=3')
      ]);
      setProgress(progressRes.data);
      setLeaderboard(leaderboardRes.data);

      // Mock recent activity data (will be replaced with real API later)
      setRecentActivity([
        { id: 1, type: 'mcq', title: 'Introduction to Python Variables', course: 'Python', score: '10/10', passed: true, time: '2 mins ago' },
        { id: 2, type: 'mcq', title: 'Data Structures: Linked Lists Basics', course: 'DSA', score: '4/10', passed: false, time: '45 mins ago' },
        { id: 3, type: 'mcq', title: 'Java OOP Concepts: Inheritance', course: 'Java', score: '8/10', passed: true, time: '2 hours ago' },
        { id: 4, type: 'coding', title: 'Two Sum Problem', course: 'DSA', score: 'Passed', passed: true, time: '3 hours ago' },
        { id: 5, type: 'coding', title: 'Binary Search Implementation', course: 'Algorithms', score: 'Failed', passed: false, time: '1 day ago' },
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalCoding = progress?.total_attempted || 142;
  const totalMCQs = 856; // Will come from API later
  const passPercentage = progress?.success_rate || 78.4;
  const currentStreak = progress?.current_streak || 12;
  const weeklyGoalTarget = 50;
  const weeklyGoalProgress = 32;

  const filteredActivity = recentActivity.filter(a => a.type === activeTab);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-6 pb-24 md:pb-8 overflow-y-auto">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Welcome back, {user?.name || user?.username || 'Student'}! 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Ready to solve some problems today?</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full md:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>

            {/* Streak Badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
              <Flame className="text-orange-500" size={20} />
              <div className="text-sm">
                <span className="font-bold text-blue-700">{currentStreak} Day</span>
                <p className="text-blue-600 text-xs">Streak</p>
              </div>
            </div>

            {/* User Avatar */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="font-semibold text-gray-800">{user?.name || user?.username}</p>
                <p className="text-xs text-gray-500">Student ID: {user?.id?.slice(0, 8) || 'N/A'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {(user?.name || user?.username || 'S')[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6">

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Coding Questions Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Code className="text-blue-600" size={24} />
                  </div>
                  <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                    <TrendingUp size={14} /> +12%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{totalCoding}</h3>
                <p className="text-gray-500 text-sm">Total Coding Questions Practiced</p>
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>

              {/* MCQ Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-green-600" size={24} />
                  </div>
                  <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                    <TrendingUp size={14} /> +54 today
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{totalMCQs}</h3>
                <p className="text-gray-500 text-sm">Total MCQs Practiced</p>
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              {/* Pass Percentage Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-emerald-600" size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{passPercentage.toFixed(1)}%</h3>
                <p className="text-gray-500 text-sm">Overall Pass Percentage</p>
                <div className="mt-4 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Passing
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span> Failing
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock size={20} className="text-gray-400" />
                  Recent Activity
                </h2>

                {/* Tab Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('mcq')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'mcq'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    MCQs
                  </button>
                  <button
                    onClick={() => setActiveTab('coding')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'coding'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Coding Questions
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.passed ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        {activity.passed
                          ? <Check className="text-green-600" size={20} />
                          : <X className="text-red-500" size={20} />
                        }
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {activity.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {activity.course}
                          </span>
                          <span className="text-gray-400 text-sm">Score: {activity.score}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm">{activity.time}</span>
                      <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors">
                View All History
              </button>
            </div>

            {/* Recommended for You Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  💡 Recommended for You
                </h2>
                <button className="text-blue-600 text-sm font-medium hover:underline">See all</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coding Challenge Card */}
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                    Coding Challenge
                  </span>
                  <h3 className="text-xl font-bold mt-4 mb-2">Binary Tree Traversal</h3>
                  <p className="text-white/80 text-sm mb-6">Improve your DSA weak spots.</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2.5 bg-white text-teal-600 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    Solve Now <ChevronRight size={18} />
                  </button>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                </div>

                {/* MCQ Set Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
                  <div className="flex items-start justify-between">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                      MCQ Set
                    </span>
                    <button className="text-gray-300 hover:text-yellow-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">Advanced SQL Queries</h3>
                  <p className="text-gray-500 text-sm mb-6">Based on your last failed attempt.</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="w-full lg:w-80 space-y-6">

            {/* Streak Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Flame className="text-orange-300" size={32} />
              </div>
              <h3 className="text-4xl font-bold mt-8 mb-2">{currentStreak} Day Streak!</h3>
              <p className="text-blue-100 mb-6">You're on fire! Solve 2 more coding questions today to keep it going.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                Continue Practice
              </button>
            </div>

            {/* Weekly Goal Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Weekly Goal</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-gray-500 text-sm">Target: {weeklyGoalTarget} Qs</span>
                <span className="text-blue-600 font-bold">{weeklyGoalProgress}/{weeklyGoalTarget}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${(weeklyGoalProgress / weeklyGoalTarget) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Leaderboard Top 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Leaderboard Top 3</h3>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((player, idx) => (
                  <div key={player.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{player.name}</p>
                      <p className="text-xs text-gray-400">{player.problems_solved} problems</p>
                    </div>
                    <Trophy className={`${idx === 0 ? 'text-yellow-500' :
                      idx === 1 ? 'text-gray-400' :
                        'text-orange-400'
                      }`} size={18} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
