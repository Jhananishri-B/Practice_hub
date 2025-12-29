import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { Play, Send, CheckCircle } from 'lucide-react';

const Practice = () => {
  const { courseId, levelId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startSession();
  }, [courseId, levelId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const startSession = async () => {
    try {
      const response = await api.post('/sessions/start', { courseId, levelId });
      const sessionData = response.data;
      
      // Redirect to MCQ practice if session type is MCQ
      if (sessionData.session_type === 'mcq') {
        navigate(`/mcq-practice/${courseId}/${levelId}`);
        return;
      }
      
      setSession(sessionData);
      setCode(sessionData.questions[0]?.reference_solution || '');
      setLoading(false);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start practice session');
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      alert('Please write some code before running');
      return;
    }

    const input = useCustomInput ? customInput : '';
    
    try {
      // For now, show a message - in production, this would execute the code
      alert('Code execution is running... (This is a placeholder - implement actual execution)');
    } catch (error) {
      console.error('Failed to run code:', error);
      alert('Failed to execute code');
    }
  };

  const handleSubmit = async () => {
    if (!session) return;

    const currentQuestion = session.questions[currentQuestionIndex];
    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    try {
      const response = await api.post(`/sessions/${session.id}/submit`, {
        questionId: currentQuestion.question_id,
        code,
        language,
      });

      // Show result feedback
      if (response.data.is_correct) {
        alert('✅ All test cases passed!');
      } else {
        alert(`❌ ${response.data.test_cases_passed || 0}/${response.data.total_test_cases || 0} test cases passed`);
      }

      // Move to next question or complete session
      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        const nextQuestion = session.questions[currentQuestionIndex + 1];
        setCode(nextQuestion.reference_solution || '');
      } else {
        // Complete session
        await api.post(`/sessions/${session.id}/complete`);
        navigate(`/results/${session.id}`);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to submit solution';
      alert(errorMessage);
      
      // If language error, show specific message
      if (errorMessage.includes('Invalid language')) {
        alert('Please use the correct programming language for this course!');
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading || !session) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">Loading...</div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex">
        <div className="flex-1 p-6">
          <div className="mb-4 flex gap-2">
            {session.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setCode(session.questions[index].reference_solution || '');
                }}
                className={`px-4 py-2 rounded-lg font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentQuestion.title}</h2>
            <div className="prose max-w-none mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{currentQuestion.description}</p>
            </div>

            {currentQuestion.constraints && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Constraints:</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{currentQuestion.constraints}</p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Test Cases:</h3>
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Test Case 1: Sample input/output</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Test Case 2: Sample input/output</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="python">Python 3.10</option>
              <option value="c">C</option>
            </select>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>

          <div className="p-4 border-t border-gray-200 space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useCustomInput}
                  onChange={(e) => setUseCustomInput(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Test with custom input</span>
              </label>
              <div className="text-lg font-semibold text-gray-800">{formatTime(timeLeft)}</div>
            </div>

            {useCustomInput && (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom input..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRun}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Play size={18} />
                Run
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send size={18} />
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;

