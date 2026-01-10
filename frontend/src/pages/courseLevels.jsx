import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Check, Lock, BookOpen, ExternalLink } from 'lucide-react';

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
    // Navigate to Learning Phase (AI Lesson Plan)
    navigate(`/courses/${courseId}/level/${level.id}/learn`);
  };

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
    return 'linear-gradient(to bottom right, #667eea, #764ba2)';
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 md:p-8">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 pb-24 md:pb-8">
        <div className="mb-6">
          <nav className="text-sm text-gray-600 mb-4">
            Courses / {course?.title}
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {course?.title}
            {course?.title && (
              <span className={`ml-3 text-sm px-2 py-1 rounded text-white align-middle ${getDifficultyColor(course.title)}`}>
                {getDifficultyLabel(course.title)}
              </span>
            )}
          </h1>
          <p className="text-gray-600">{course?.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${level.status === 'locked' ? 'opacity-60' : ''
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

                {/* Topic Description & Materials */}
                {(level.topic_description || level.learning_materials) && (
                  <div className="mb-4 pt-3 border-t border-gray-100 space-y-3">
                    {level.topic_description && (
                      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2 rounded">
                        {level.topic_description}
                      </p>
                    )}

                    {level.learning_materials && (() => {
                      const materials = typeof level.learning_materials === 'string'
                        ? JSON.parse(level.learning_materials)
                        : level.learning_materials;
                      const resources = materials.resources || [];

                      return resources.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            <BookOpen size={12} /> Materials
                          </div>
                          <div className="space-y-1 pl-1">
                            {resources.map((mat, idx) => (
                              <a
                                key={idx}
                                href={mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate block"
                              >
                                <ExternalLink size={10} className="flex-shrink-0" />
                                {mat.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <button
                  onClick={() => {
                    // Start Level Clicked
                    handleLevelClick(level);
                  }}
                  disabled={level.status === 'locked'}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${level.status === 'completed'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : level.status === 'locked'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {level.status === 'completed'
                    ? 'Review Lesson'
                    : level.status === 'locked'
                      ? 'Locked'
                      : 'Start Learning Phase'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
};

export default CourseLevels;

