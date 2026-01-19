import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Plus, Edit, Trash2, Clock, Upload, ArrowLeft, Loader, Sparkles, X } from 'lucide-react';

const AdminCourseLevels = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingLevel, setEditingLevel] = useState(null); // Track which level title is being edited: levelId
  const mcqHeaders = [
    'Problem Title',
    'Question Description',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Correct Answer (Text)',
  ];

  // Level title mapping for Machine Learning course
  const levelTitleMap = {
    1: 'ML Basics',
    2: 'Regression Core',
    3: 'Model Metrics',
    4: 'Tree Models',
    5: 'Probabilistic Models',
    6: 'Advanced Classification',
    7: 'Clustering Basics',
    8: 'Advanced Clustering',
    9: 'Model Comparison',
    10: 'ML Mastery'
  };

  // Modals
  const [timeLimitModal, setTimeLimitModal] = useState({ show: false, levelId: null, timeLimit: null });
  const [csvUploadModal, setCsvUploadModal] = useState({ show: false, levelId: null, uploading: false, questionType: null });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [coursesRes, levelsRes, questionsRes] = await Promise.all([
        api.get('/courses'), // Fetch all courses to find current one
        api.get(`/courses/${courseId}/levels`),
        api.get('/questions') // Fetch all questions to filter by level
      ]);

      const currentCourse = coursesRes.data.find(c => c.id === courseId);
      setCourse(currentCourse);
      setLevels(levelsRes.data);

      // Group questions by level
      const questionsByLevel = {};
      const allQuestions = questionsRes.data.data || [];
      allQuestions.forEach(q => {
        if (!questionsByLevel[q.level_id]) questionsByLevel[q.level_id] = [];
        questionsByLevel[q.level_id].push(q);
      });
      setQuestions(questionsByLevel);

    } catch (err) {
      console.error('Failed to load course data:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleCsvFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvUploadModal(prev => ({ ...prev, uploading: true }));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level_id', csvUploadModal.levelId);
    if (csvUploadModal.questionType) formData.append('question_type', csvUploadModal.questionType);

    try {
      const res = await api.post('/admin/questions/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.errors && res.data.errors.length > 0) {
        alert(`Uploaded ${res.data.count} questions!\nErrors: ${res.data.errors.length}\n\n${res.data.errors.slice(0, 5).join('\n')}${res.data.errors.length > 5 ? '\n...' : ''}`);
      } else {
      alert(`Uploaded ${res.data.count} questions! Errors: ${res.data.errors?.length || 0}`);
      }
      setCsvUploadModal({ show: false, levelId: null, uploading: false, questionType: null });
      fetchData();
    } catch (err) {
      console.error('CSV upload error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Upload failed';
      const errorDetails = err.response?.data?.details || '';
      alert(`Upload failed: ${errorMessage}${errorDetails ? '\n\nDetails: ' + errorDetails.substring(0, 200) : ''}`);
      setCsvUploadModal(prev => ({ ...prev, uploading: false }));
    }
  };


  const handleAddLevel = async () => {
    const title = prompt('Enter new level title:');
    if (!title || !title.trim()) return;

    try {
      const nextLevelNumber = levels.length + 1;
      await api.post('/admin/levels', {
        course_id: courseId,
        level_number: nextLevelNumber,
        title: title.trim(),
        description: ''
      });
      fetchData();
    } catch (err) {
      console.error('Failed to add level:', err);
      alert('Failed to add level');
    }
  };


  if (loading) return <div className="flex min-h-screen items-center justify-center text-blue-600">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate('/admin/courses')} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-2">
              <ArrowLeft size={18} className="mr-1" /> Back
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{course?.title}</h1>
            <p className="text-gray-500 mt-1">{course?.levels?.length || 0} Levels • Last updated {new Date().toLocaleDateString()}</p>
          </div>
          <button
            onClick={handleAddLevel}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-medium"
          >
            <Plus size={20} /> Add New Level
          </button>
        </div>

        {/* Levels Grid */}
        <div className="space-y-8">
          {levels.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">No Levels Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2 mb-6">Start building your course structure by adding the first level.</p>
              <button onClick={handleAddLevel} className="text-blue-600 font-semibold hover:underline">Create First Level</button>
            </div>
          )}

          {levels.map((level, idx) => (
            <div key={level.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">

              {/* Level Header */}
              <div className="p-6 border-b border-gray-50 flex items-start justify-between bg-gradient-to-r from-white to-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border border-blue-200">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {editingLevel === level.id ? (
                        <input
                          type="text"
                          defaultValue={level.title || levelTitleMap[level.level_number]}
                          onBlur={(e) => {
                            // Save the new title
                            const newTitle = e.target.value.trim();
                            const currentTitle = level.title || levelTitleMap[level.level_number];
                            if (newTitle && newTitle !== currentTitle) {
                              // Update level title via API
                              api.put(`/admin/levels/${level.id}/details`, {
                                title: newTitle
                              }).then(() => {
                                // Refresh data to get updated title
                                fetchData();
                                setEditingLevel(null);
                                alert('✅ Title updated successfully!');
                              }).catch(err => {
                                alert('Failed to update level title: ' + (err.response?.data?.error || err.message));
                                setEditingLevel(null);
                              });
                            } else {
                              setEditingLevel(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            } else if (e.key === 'Escape') {
                              setEditingLevel(null);
                            }
                          }}
                          className="text-xl font-bold text-gray-800 border-2 border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {level.title || levelTitleMap[level.level_number]}
                          </h3>
                          <button
                            onClick={() => setEditingLevel(level.id)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                            title="Edit title"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      )}
                      {editingLevel === level.id ? (
                        <button
                          onClick={() => setEditingLevel(null)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Cancel editing"
                        >
                          <X size={18} />
                        </button>
                      ) : null}
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5">{level.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/courses/${courseId}/level/${level.id}/learn`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 font-medium text-sm"
                  >
                    <Edit size={16} /> View Overview
                  </button>
                  <button
                    onClick={() => setCsvUploadModal({ show: true, levelId: level.id, uploading: false, questionType: null })}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100 font-medium text-sm"
                  >
                    <Upload size={16} /> Import CSV
                  </button>
                  <button
                    onClick={() => navigate(`/admin/questions/create?levelId=${level.id}&courseId=${courseId}`)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Add Manual Question"
                  >
                    <Plus size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Questions Body - Navigate to questions page when buttons are clicked */}
              <div className="p-6 bg-gray-50/30">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/admin/courses/${courseId}/levels/${level.id}/questions?type=coding`)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                  >
                    Coding Questions
                  </button>
                  <button
                    onClick={() => navigate(`/admin/courses/${courseId}/levels/${level.id}/questions?type=mcq`)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                  >
                    MCQ Questions
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>



        {/* CSV UPLOAD MODAL */}
        {csvUploadModal.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Upload className="text-green-600" /> Upload CSV
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {!csvUploadModal.questionType ? (
                  <div className="flex gap-4">
                    <button onClick={() => setCsvUploadModal({ ...csvUploadModal, questionType: 'coding' })} className="flex-1 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 text-gray-600 hover:text-blue-600">
                      <span className="font-bold">Coding</span>
                    </button>
                    <button onClick={() => setCsvUploadModal({ ...csvUploadModal, questionType: 'mcq' })} className="flex-1 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center gap-2 text-gray-600 hover:text-green-600">
                      <span className="font-bold">MCQ</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload <b>{csvUploadModal.questionType}</b> questions CSV.
                    </p>
                    {csvUploadModal.questionType === 'mcq' && (
                      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Required columns (exact):</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          {mcqHeaders.map(header => (
                            <li key={header}>{header}</li>
                          ))}
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">
                          Correct Answer (Text) must exactly match one option (case-insensitive).
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileSelect}
                      disabled={csvUploadModal.uploading}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {csvUploadModal.uploading && <div className="mt-4 text-center text-blue-600 text-sm font-medium animate-pulse">Uploading and processing...</div>}
                  </div>
                )}
                <button onClick={() => setCsvUploadModal({ show: false, levelId: null, uploading: false, questionType: null })} className="w-full py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCourseLevels;
