import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Plus, Edit, Trash2, Clock, Upload } from 'lucide-react';

const AdminCourseLevels = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLimitModal, setTimeLimitModal] = useState({ show: false, levelId: null, timeLimit: null });
  const [csvUploadModal, setCsvUploadModal] = useState({ show: false, levelId: null, uploading: false });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      // Get course info
      const coursesResponse = await api.get('/admin/courses/with-levels');
      const courseData = coursesResponse.data.find((c) => c.id === courseId);
      setCourse(courseData);
      setLevels(courseData?.levels || []);

      // Fetch questions for each level
      const questionsMap = {};
      for (const level of courseData?.levels || []) {
        try {
          const questionsResponse = await api.get(`/admin/levels/${level.id}/questions`);
          questionsMap[level.id] = questionsResponse.data;
        } catch (error) {
          console.error(`Failed to fetch questions for level ${level.id}:`, error);
          questionsMap[level.id] = [];
        }
      }
      setQuestions(questionsMap);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId, levelId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await api.delete(`/admin/questions/${questionId}`);
      // Refresh questions for this level
      const questionsResponse = await api.get(`/admin/levels/${levelId}/questions`);
      setQuestions({ ...questions, [levelId]: questionsResponse.data });
      // Refresh course data to update last updated date
      const coursesResponse = await api.get('/admin/courses/with-levels');
      const courseData = coursesResponse.data.find((c) => c.id === courseId);
      setCourse(courseData);
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question');
    }
  };

  const handleEditQuestion = (questionId, questionType) => {
    navigate(`/admin/questions/edit/${questionId}?type=${questionType}&courseId=${courseId}`);
  };

  const handleSetTimeLimit = (levelId, currentTimeLimit) => {
    setTimeLimitModal({
      show: true,
      levelId,
      timeLimit: currentTimeLimit || '',
    });
  };

  const handleSaveTimeLimit = async () => {
    try {
      const timeLimit = timeLimitModal.timeLimit ? parseInt(timeLimitModal.timeLimit) : null;
      await api.put(`/admin/levels/${timeLimitModal.levelId}/time-limit`, { time_limit: timeLimit });
      setTimeLimitModal({ show: false, levelId: null, timeLimit: null });
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Failed to update time limit:', error);
      alert('Failed to update time limit');
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'Not set';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleCsvUpload = (levelId) => {
    setCsvUploadModal({ show: true, levelId, uploading: false });
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setCsvUploadModal({ ...csvUploadModal, uploading: true });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('level_id', csvUploadModal.levelId);

      const response = await api.post('/admin/questions/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.errors && response.data.errors.length > 0) {
        alert(`Uploaded ${response.data.count} questions successfully.\n\nErrors:\n${response.data.errors.join('\n')}`);
      } else {
        alert(`Successfully uploaded ${response.data.count} questions!`);
      }
      setCsvUploadModal({ show: false, levelId: null, uploading: false });
      // Refresh questions
      fetchData();
    } catch (error) {
      console.error('CSV upload error:', error);
      alert(error.response?.data?.error || 'Failed to upload CSV file');
      setCsvUploadModal({ ...csvUploadModal, uploading: false });
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
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/courses')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Courses
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{course?.title}</h1>
              <p className="text-gray-600">
                Last updated: {course?.updated_at ? new Date(course.updated_at).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {levels.map((level) => (
            <div key={level.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      Level {level.level_number}: {level.title}
                    </h3>
                    <button
                      onClick={() => handleSetTimeLimit(level.id, level.time_limit)}
                      className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Set time limit for this level"
                    >
                      <Clock size={16} />
                      {formatTime(level.time_limit)}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCsvUpload(level.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    title="Upload questions from CSV"
                  >
                    <Upload size={18} />
                    Upload CSV
                  </button>
                  <button
                    onClick={() => navigate(`/admin/questions/create?levelId=${level.id}&courseId=${courseId}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Add Question
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Questions ({questions[level.id]?.length || 0})
                </h4>
                {questions[level.id] && questions[level.id].length > 0 ? (
                  <div className="space-y-3">
                    {questions[level.id].map((question) => (
                      <div
                        key={question.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                question.question_type === 'coding'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {question.question_type.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {question.difficulty}
                            </span>
                          </div>
                          <h5 className="font-medium text-gray-800">{question.title}</h5>
                          <p className="text-sm text-gray-600 line-clamp-2">{question.description}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditQuestion(question.id, question.question_type)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit question"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id, level.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete question"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No questions added yet</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Time Limit Modal */}
        {timeLimitModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Set Time Limit</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (in seconds)
                </label>
                <input
                  type="number"
                  value={timeLimitModal.timeLimit}
                  onChange={(e) =>
                    setTimeLimitModal({ ...timeLimitModal, timeLimit: e.target.value })
                  }
                  placeholder="e.g., 3600 for 1 hour"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to remove time limit. Examples: 1800 (30 min), 3600 (1 hour), 7200 (2 hours)
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setTimeLimitModal({ show: false, levelId: null, timeLimit: null })}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTimeLimit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV Upload Modal */}
        {csvUploadModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Questions from CSV</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Upload a CSV file with questions. Required columns:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-xs font-mono text-gray-700">
                    For Coding Questions:<br />
                    title, description, input_format, output_format, constraints, reference_solution, difficulty, test_cases<br />
                    <br />
                    For MCQ Questions:<br />
                    title, description, option1, option2, option3, option4, correct_option, difficulty
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={csvUploadModal.uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {csvUploadModal.uploading && (
                  <p className="text-sm text-blue-600 mt-2">Uploading and processing questions...</p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCsvUploadModal({ show: false, levelId: null, uploading: false })}
                  disabled={csvUploadModal.uploading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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

export default AdminCourseLevels;
