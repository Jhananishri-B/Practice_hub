import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Users, Activity, FileText, AlertCircle, Search, Edit, Trash2, Trophy } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      const [statsResponse, leaderboardResponse] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/progress/leaderboard?limit=20'),
      ]);
      setStats(statsResponse.data);
      setLeaderboard(leaderboardResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the leaderboard?')) {
      return;
    }

    try {
      // Filter out the deleted user from the leaderboard
      setLeaderboard(leaderboard.filter((user) => user.id !== userId));
      // Note: In a real app, you'd call an API to delete the user
      alert('User removed from leaderboard');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to remove user');
    }
  };

  const handleEditUser = (user) => {
    // In a real app, this would open an edit modal
    const newName = prompt('Enter new name:', user.name);
    if (newName && newName.trim()) {
      setLeaderboard(
        leaderboard.map((u) => (u.id === user.id ? { ...u, name: newName.trim() } : u))
      );
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-blue-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {stats?.total_users || 0}
            </h3>
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-green-600 text-xs mt-2">+12% vs last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="text-green-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {stats?.active_learners || 0}
            </h3>
            <p className="text-gray-600 text-sm">Active Learners</p>
            <p className="text-gray-500 text-xs mt-2">Currently online</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="text-purple-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {stats?.questions_attempted || 0}
            </h3>
            <p className="text-gray-600 text-sm">Questions Attempted</p>
            <p className="text-green-600 text-xs mt-2">+540 today</p>
          </div>

          <div className="bg-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats?.pending_approvals || 0}</h3>
            <p className="text-white/80 text-sm mb-4">Pending Approvals</p>
            <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100">
              Review Now
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-500" size={24} />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Leaderboard</h2>
                <p className="text-gray-600 text-sm">Top performers ranked by levels cleared</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard
                  .filter((user) => {
                    if (!searchTerm) return true;
                    const search = searchTerm.toLowerCase();
                    return (
                      user.name?.toLowerCase().includes(search) ||
                      user.roll_number?.toLowerCase().includes(search) ||
                      user.id?.toLowerCase().includes(search)
                    );
                  })
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            user.rank === 1
                              ? 'bg-yellow-500'
                              : user.rank === 2
                              ? 'bg-gray-400'
                              : user.rank === 3
                              ? 'bg-orange-500'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {user.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.roll_number || user.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            <span className="text-gray-600 font-semibold">
                              {user.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.levels_cleared || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit user"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete user"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

