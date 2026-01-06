import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/progress/leaderboard?limit=20');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Leaderboard</h1>
        <p className="text-gray-600 mb-8">Top performers in AI problem solving this week</p>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Levels Cleared
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-gray-50 ${user?.id === entry.id ? 'bg-yellow-50 hover:bg-yellow-100' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${entry.rank === 1
                          ? 'bg-yellow-500'
                          : entry.rank === 2
                            ? 'bg-gray-400'
                            : entry.rank === 3
                              ? 'bg-orange-500'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                      {entry.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.roll_number || entry.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        <span className="text-gray-600 font-semibold">
                          {entry.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className={`text-sm font-medium ${user?.id === entry.id ? 'text-blue-700 font-bold' : 'text-gray-900'}`}>
                        {entry.name || 'Unknown'} {user?.id === entry.id && '(You)'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.levels_cleared || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
