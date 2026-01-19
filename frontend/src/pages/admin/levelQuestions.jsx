import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';

const LevelQuestions = () => {
  const { courseId, levelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionType, setQuestionType] = useState(searchParams.get('type') || 'coding'); // 'coding' | 'mcq'

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

  useEffect(() => {
    const typeFromUrl = searchParams.get('type') || 'coding';
    setQuestionType(typeFromUrl);
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [courseId, levelId, questionType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch level details
      const levelRes = await api.get(`/courses/${courseId}/levels/${levelId}`);
      setLevel(levelRes.data);

      // Fetch questions for this level
      const questionsRes = await api.get(`/admin/levels/${levelId}/questions`);
      const allQuestions = questionsRes.data.data || questionsRes.data || [];
      
      // Filter by question type
      const filteredQuestions = allQuestions.filter(q => q.question_type === questionType);
      setQuestions(filteredQuestions);

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
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                {levelTitleMap[level?.level_number] || level?.title || 'Level Questions'}
              </h1>
              <p className="text-gray-500 mt-1">
                {questions.length} {questionType === 'coding' ? 'Coding' : 'MCQ'} Questions
              </p>
            </div>
            <button
              onClick={() => navigate(`/admin/questions/create?levelId=${levelId}&courseId=${courseId}&type=${questionType}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-medium"
            >
              <Plus size={20} /> Add Question
            </button>
          </div>
        </div>

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
              <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/admin/questions/edit/${q.id}?type=${q.question_type}`)} 
                    className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors" 
                    title="Edit Question"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id, q.title)}
                    className="p-2 hover:bg-red-50 rounded text-gray-500 hover:text-red-600 transition-colors" 
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
