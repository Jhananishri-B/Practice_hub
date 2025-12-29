import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { CheckCircle, TrendingUp, Flame } from 'lucide-react';

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/progress/me');
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Progress</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="text-blue-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {progress?.total_attempted || 0}
            </h3>
            <p className="text-gray-600">Problems Solved</p>
            <p className="text-sm text-gray-500 mt-2">Top 5% of learners</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-green-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {Math.round(progress?.success_rate || 0)}%
            </h3>
            <p className="text-gray-600">Success Rate</p>
            <p className="text-sm text-green-600 mt-2">+2.4% Consistency is key</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="text-orange-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {progress?.current_streak || 0} Days
            </h3>
            <p className="text-gray-600">Current Streak</p>
            <p className="text-sm text-orange-600 mt-2">Keep the flame alive!</p>
          </div>
        </div>

        {progress?.recent_session && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Session</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {progress.recent_session.level_title}
                </h3>
                <p className="text-gray-600 text-sm">
                  Test Cases Passed: {progress.recent_session.completed_questions}/
                  {progress.recent_session.total_questions}
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Resume Practice →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;

