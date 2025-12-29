import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Check, Lock } from 'lucide-react';

const CourseLevels = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modeSelection, setModeSelection] = useState({
    open: false,
    level: null,
  });

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
    // Ask user whether they want Coding Test or MCQ Practice
    setModeSelection({ open: true, level });
  };

  const getCourseImage = () => {
    const title = course?.title?.toLowerCase() || '';

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

    // Fallback gradient
    return 'linear-gradient(to bottom right, #667eea, #764ba2)';
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
              <div className="h-32 w-full overflow-hidden bg-gray-200">
                <img
                  src={getCourseImage()}
                  alt={course?.title || 'Course banner'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(to bottom right, #667eea, #764ba2)';
                  }}
                />
              </div>
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

        {/* Mode selection dialog */}
        {modeSelection.open && modeSelection.level && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Choose Practice Type
              </h2>
              <p className="text-gray-600 mb-6">
                Do you want to practice coding questions or MCQ questions for this level?
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigate(`/practice/${courseId}/${modeSelection.level.id}`, {
                      state: { sessionType: 'coding' },
                    });
                    setModeSelection({ open: false, level: null });
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Coding Test
                </button>
                <button
                  onClick={() => {
                    navigate(`/mcq-practice/${courseId}/${modeSelection.level.id}`, {
                      state: { sessionType: 'mcq' },
                    });
                    setModeSelection({ open: false, level: null });
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                >
                  MCQ Practice
                </button>
                <button
                  onClick={() => setModeSelection({ open: false, level: null })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLevels;

