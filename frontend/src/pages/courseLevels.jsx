import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Check, Lock, Play } from 'lucide-react';

const CourseLevels = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseResponse, levelsResponse] = await Promise.all([
        api.get('/courses'),
        api.get(`/courses/${courseId}/levels`),
      ]);

      const courseData = courseResponse.data.find((c) => c.id === courseId);
      setCourse(courseData);
      setLevels(levelsResponse.data);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelClick = (level) => {
    if (level.status === 'locked') {
      alert('Complete previous levels to unlock this level');
      return;
    }
    navigate(`/practice/${courseId}/${level.id}`);
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
        <div className="mb-6">
          <nav className="text-sm text-gray-600 mb-4">
            Courses / {course?.title}
          </nav>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{course?.title}</h1>
          <p className="text-gray-600">{course?.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                level.status === 'locked' ? 'opacity-60' : ''
              }`}
            >
              <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-600">
                    Level {level.level_number}
                  </span>
                  {level.status === 'completed' && (
                    <Check className="text-green-600" size={20} />
                  )}
                  {level.status === 'locked' && (
                    <Lock className="text-gray-400" size={20} />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{level.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{level.description}</p>
                <button
                  onClick={() => handleLevelClick(level)}
                  disabled={level.status === 'locked'}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    level.status === 'completed'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : level.status === 'locked'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {level.status === 'completed'
                    ? 'Review'
                    : level.status === 'locked'
                    ? 'Locked'
                    : 'Start Level'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseLevels;

