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
  const [modeSelection, setModeSelection] = useState({
    open: false,
    level: null,
  });

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);


  const fetchCourseData = async () => {
    try {
      setLoading(true);
      console.log(`[CourseLevels] Fetching data for courseId: ${courseId}`);
      
      const [courseResponse, levelsResponse] = await Promise.all([
        api.get('/courses').catch(err => {
          console.error('[CourseLevels] Error fetching courses:', err);
          return { data: [] };
        }),
        api.get(`/courses/${courseId}/levels`).catch(err => {
          console.error(`[CourseLevels] Error fetching levels for course ${courseId}:`, err);
          return { data: [] };
        }),
      ]);

      const courseData = courseResponse.data?.find((c) => c.id === courseId);
      console.log(`[CourseLevels] Course data:`, courseData);
      console.log(`[CourseLevels] Levels data:`, levelsResponse.data);
      
      setCourse(courseData || null);
      setLevels(levelsResponse.data || []);
    } catch (error) {
      console.error('[CourseLevels] Failed to fetch course data:', error);
      setCourse(null);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelClick = (level) => {
    // All levels are now unlocked, so no need to check status
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
    if (title.includes('cloud computing')) {
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop';
    }
    if (title.includes('deep learning')) {
      return 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop';
    }
    if (title.includes('data science')) {
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop';
    }

    // Fallback gradient
    return null;
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
          </h1>
          <p className="text-gray-600">{course?.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {levels.map((level) => (
            <div
              key={level.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-32 w-full overflow-hidden bg-gray-200 relative">
                {getCourseImage() ? (
                  <img
                    src={getCourseImage()}
                    alt={course?.title || 'Course banner'}
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
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-600">
                    Level {level.level_number}
                  </span>
                  {level.status === 'completed' && (
                    <Check className="text-green-600" size={20} />
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
                  onClick={() => handleLevelClick(level)}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    level.status === 'completed'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {level.status === 'completed' ? 'Review' : 'Start Level'}
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
    </Layout>
  );
};

export default CourseLevels;

