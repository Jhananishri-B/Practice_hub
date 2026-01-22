import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { ArrowLeft, Edit, Trash2, Plus, X } from 'lucide-react';

const LevelQuestions = () => {
  const { courseId, levelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionType, setQuestionType] = useState(searchParams.get('type') || 'coding'); // 'coding' | 'mcq'
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingLevelTitle, setEditingLevelTitle] = useState(false);
  const [editingLevelDescription, setEditingLevelDescription] = useState(false);

  // Level title mapping removed in favor of dynamic titles from backend

  // Filter questions based on current question type (client-side filtering for instant tab switch)
  const questions = allQuestions.filter(q => q.question_type === questionType);

  useEffect(() => {
    const typeFromUrl = searchParams.get('type') || 'coding';
    setQuestionType(typeFromUrl);
    // Reset selection when switching tabs
    setSelectedIds(new Set());
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [courseId, levelId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch level details
      const levelRes = await api.get(`/courses/${courseId}/levels/${levelId}`);
      setLevel(levelRes.data);

      // Fetch questions for this level
      const questionsRes = await api.get(`/admin/levels/${levelId}/questions`);
      const fetchedQuestions = questionsRes.data.data || questionsRes.data || [];

      // Store all questions without filtering
      setAllQuestions(fetchedQuestions);
      setSelectedIds(new Set()); // Reset selection on data fetch

    } catch (err) {
      console.error('Failed to load level questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId, questionTitle) => {
    if (confirm(`Are you sure you want to delete "${questionTitle}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/questions/${questionId}`);
        alert('Question deleted successfully');
        fetchData();
      } catch (err) {
        alert('Failed to delete question: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map(q => q.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedIds.size} questions? This action cannot be undone.`)) {
      try {
        setLoading(true);
        // Execute bulk delete via improved API
        await api.post('/admin/questions/bulk-delete', { questionIds: Array.from(selectedIds) });

        alert('Questions deleted successfully');
        // Clear selection and refresh
        setSelectedIds(new Set());
        fetchData();
      } catch (err) {
        alert('Failed to delete questions: ' + (err.response?.data?.error || err.message));
        setLoading(false); // Only stop loading on error, otherwise fetchData will handle it
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-blue-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/admin/courses/${courseId}/levels`)}
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft size={18} className="mr-1" /> Back
          </button>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {editingLevelTitle ? (
                  <input
                    type="text"
                    defaultValue={level?.title || ''}
                    onBlur={(e) => {
                      const newTitle = e.target.value.trim();
                      const currentTitle = level?.title || '';
                      if (newTitle && newTitle !== currentTitle) {
                        api.put(`/admin/levels/${levelId}/details`, {
                          title: newTitle
                        }).then(() => {
                          fetchData();
                          setEditingLevelTitle(false);
                          alert('✅ Level title updated successfully!');
                        }).catch(err => {
                          alert('Failed to update level title: ' + (err.response?.data?.error || err.message));
                          setEditingLevelTitle(false);
                        });
                      } else {
                        setEditingLevelTitle(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      } else if (e.key === 'Escape') {
                        setEditingLevelTitle(false);
                      }
                    }}
                    className="text-4xl font-extrabold text-gray-900 tracking-tight border-2 border-blue-500 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {level?.title ? `Level ${level?.level_number}: ${level?.title}` : 'Level Questions'}
                  </h1>
                )}
                {!editingLevelTitle && (
                  <button
                    onClick={() => setEditingLevelTitle(true)}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                    title="Edit level title"
                  >
                    <Edit size={20} />
                  </button>
                )}
                {editingLevelTitle && (
                  <button
                    onClick={() => setEditingLevelTitle(false)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Cancel editing"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {editingLevelDescription ? (
                <div className="mt-2">
                  <textarea
                    defaultValue={level?.description || ''}
                    onBlur={(e) => {
                      const newDescription = e.target.value.trim();
                      const currentDescription = level?.description || '';
                      if (newDescription !== currentDescription) {
                        api.put(`/admin/levels/${levelId}/details`, {
                          description: newDescription
                        }).then(() => {
                          fetchData();
                          setEditingLevelDescription(false);
                          alert('✅ Level description updated successfully!');
                        }).catch(err => {
                          alert('Failed to update level description: ' + (err.response?.data?.error || err.message));
                          setEditingLevelDescription(false);
                        });
                      } else {
                        setEditingLevelDescription(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.target.blur();
                      } else if (e.key === 'Escape') {
                        setEditingLevelDescription(false);
                      }
                    }}
                    className="w-full text-sm text-gray-700 border-2 border-blue-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    autoFocus
                    placeholder="Enter level description..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Press Ctrl+Enter to save, Esc to cancel</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 mt-1">
                  <p className="text-gray-500">
                    {level?.description || 'No description'} • {questions.length} {questionType === 'coding' ? 'Coding' : 'MCQ'} Questions
                  </p>
                  <button
                    onClick={() => setEditingLevelDescription(true)}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1 flex-shrink-0"
                    title="Edit description"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-medium"
                >
                  <Trash2 size={20} /> Delete Selected ({selectedIds.size})
                </button>
              )}
              <button
                onClick={() => navigate(`/admin/questions/create?levelId=${levelId}&courseId=${courseId}&type=${questionType}`)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-medium"
              >
                <Plus size={20} /> Add Question
              </button>
            </div>
          </div>
        </div>

        {/* Selection Header */}
        {questions.length > 0 && (
          <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={questions.length > 0 && selectedIds.size === questions.length}
                onChange={toggleSelectAll}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700 font-medium">Select All</span>
            </label>
            <span className="text-sm text-gray-500">
              {selectedIds.size} of {questions.length} selected
            </span>
          </div>
        )}

        {/* Question Type Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setQuestionType('coding');
                navigate(`/admin/courses/${courseId}/levels/${levelId}/questions?type=coding`, { replace: true });
              }}
              className={`pb-3 px-1 text-sm font-medium transition-all relative ${questionType === 'coding' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Coding Questions
              {questionType === 'coding' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>}
            </button>
            <button
              onClick={() => {
                setQuestionType('mcq');
                navigate(`/admin/courses/${courseId}/levels/${levelId}/questions?type=mcq`, { replace: true });
              }}
              className={`pb-3 px-1 text-sm font-medium transition-all relative ${questionType === 'mcq' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Multiple Choice
              {questionType === 'mcq' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>}
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-lg">
                No {questionType === 'coding' ? 'Coding' : 'MCQ'} questions in this level yet.
              </p>
              <button
                onClick={() => navigate(`/admin/questions/create?levelId=${levelId}&courseId=${courseId}&type=${questionType}`)}
                className="mt-4 text-blue-600 font-semibold hover:underline"
              >
                Add First Question
              </button>
            </div>
          ) : (
            questions.map(q => (
              <div
                key={q.id}
                className={`bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between transition-all cursor-pointer group ${selectedIds.has(q.id) ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-100 hover:border-blue-300 hover:shadow-md'}`}
                onClick={() => toggleSelect(q.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(q.id)}
                      onChange={() => toggleSelect(q.id)}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                    />
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded uppercase ${q.difficulty === 'hard' ? 'bg-red-100 text-red-600' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {q.difficulty}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-semibold text-lg group-hover:text-blue-700 transition-colors">
                      {q.title}
                    </h3>
                    {q.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {q.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/questions/edit/${q.id}?type=${q.question_type}`);
                    }}
                    className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-200"
                    title="Edit Question"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(q.id, q.title);
                    }}
                    className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                    title="Delete Question"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelQuestions;
