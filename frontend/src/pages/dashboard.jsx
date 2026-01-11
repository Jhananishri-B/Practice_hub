import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Search, Play } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verify token exists before fetching
    const token = localStorage.getItem('token');
    console.log('Dashboard mounted. Token exists:', !!token, 'Token value:', token);
    if (token) {
      fetchCourses();
    } else {
      console.error('No token found in localStorage! Redirecting to login...');
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching courses with token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
      
      const response = await api.get('/courses');
      console.log('Courses fetched successfully:', response.data?.length || 0, 'courses');
      console.log('Courses data:', response.data);
      setCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error details:', error.response?.data || error.message);
      
      // If 401, token might be invalid - clear it
      if (error.response?.status === 401) {
        console.error('401 Unauthorized - Token issue. Current token:', localStorage.getItem('token'));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      
      setCourses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (title) => {
    if (title.includes('Python')) return 'bg-blue-500';
    if (title.includes('C')) return 'bg-orange-500';
    if (title.includes('Machine Learning')) return 'bg-purple-500';
    if (title.includes('Data Science')) return 'bg-green-500';
    if (title.includes('Deep Learning')) return 'bg-indigo-500';
    if (title.includes('Cloud')) return 'bg-cyan-500';
    return 'bg-gray-500';
  };

  const getDifficultyLabel = (title) => {
    if (title.includes('Python')) return 'BEGINNER';
    if (title.includes('C')) return 'INTERMEDIATE';
    if (title.includes('Machine Learning')) return 'ADVANCED';
    if (title.includes('Data Science')) return 'INTERMEDIATE';
    if (title.includes('Deep Learning')) return 'ADVANCED';
    if (title.includes('Cloud')) return 'INTERMEDIATE';
    return 'BEGINNER';
  };

  const getCourseImage = (courseTitle) => {
    const title = courseTitle?.toLowerCase() || '';

    // Use external image URLs for each course
    if (title.includes('c programming') || title === 'c') {
      return 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*2p6xGs1MCtjM7Giw5gmkpQ.jpeg';
    }
    if (title.includes('machine learning')) {
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB9ktsMFQBpwgQEp6lzgBkqNoBzZJ5UK5WoQ&s';
    }
    if (title.includes('python')) {
      return 'https://webandcrafts.com/_next/image?url=https%3A%2F%2Fadmin.wac.co%2Fuploads%2FFeatures_Of_Python_1_f4ccd6d9f7.jpg&w=4500&q=90';
    }
    if (title.includes('data science')) {
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
    }
    if (title.includes('deep learning')) {
      return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80';
    }
    if (title.includes('cloud')) {
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
    }


    // Fallback gradient
    return null;
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Hello, {user?.name || user?.username || 'Student'}!</h1>
          <p className="text-gray-600">Ready to code today? Your streak is on fire! 🔥</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for a skill or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Available Courses</h2>
          {loading ? (
            <div className="text-center py-12">Loading courses...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredCourses.map((course) => {
                const courseImage = getCourseImage(course.title);
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-32 w-full overflow-hidden bg-gray-200 relative">
                      {courseImage ? (
                        <img
                          src={courseImage}
                          alt={course.title || 'Course banner'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.style.background = 'linear-gradient(to bottom right, #667eea, #764ba2)';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                      )}
                      <span
                        className={`absolute bottom-2 left-2 px-2 py-1 text-xs font-semibold text-white rounded ${getDifficultyColor(
                          course.title
                        )}`}
                      >
                        {getDifficultyLabel(course.title)}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                      <button
                        onClick={() => navigate(`/courses/${course.id}/levels`)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Start Course →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

