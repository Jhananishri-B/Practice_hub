import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { Play, Send, CheckCircle, Lock, Check, X } from 'lucide-react';

const Practice = () => {
  const { courseId, levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [selectionPhase, setSelectionPhase] = useState(true);
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState([]);
  const [testResultsByQuestion, setTestResultsByQuestion] = useState({});

  useEffect(() => {
    startSession();
  }, [courseId, levelId]);

  useEffect(() => {
    if (!session) return;

    if (timeLeft <= 0 && !autoSubmitted) {
      // Auto-submit when time limit is reached
      handleFinish(true);
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, session, autoSubmitted]);

  const startSession = async () => {
    try {
      const sessionTypeFromState = location.state?.sessionType || 'coding';
      const response = await api.post('/sessions/start', {
        courseId,
        levelId,
        sessionType: sessionTypeFromState,
      });
      const sessionData = response.data;

      // Redirect defensively if backend returns MCQ session
      if (sessionData.session_type === 'mcq') {
        navigate(`/mcq-practice/${courseId}/${levelId}`, {
          state: { sessionType: 'mcq' },
        });
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

    const questionsForTest = getActiveQuestions();
    const currentQuestion = questionsForTest[currentQuestionIndex];
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

      // Store per-question test results so we can colour individual test cases
      if (response.data.test_results) {
        setTestResultsByQuestion((prev) => ({
          ...prev,
          [currentQuestionIndex]: response.data.test_results,
        }));
      }

      // Show result feedback
      if (response.data.is_correct) {
        alert('✅ All test cases passed!');
      } else {
        alert(
          `❌ ${response.data.test_cases_passed || 0}/${
            response.data.total_test_cases || 0
          } test cases passed`
        );
      }

      // Move to next question or stay on the same one – user can navigate manually
      if (currentQuestionIndex < questionsForTest.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const nextQuestion = questionsForTest[nextIndex];
        setCode(nextQuestion.reference_solution || '');
      } else {
        alert('You have attempted all selected questions. You can review or finish the test.');
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

  const handleFinish = async (auto = false) => {
    if (!session) return;

    if (!auto) {
      const confirmFinish = window.confirm('Are you willing to finish the test?');
      if (!confirmFinish) {
        return;
      }
    } else {
      setAutoSubmitted(true);
    }

    try {
      await api.post(`/sessions/${session.id}/complete`);
      alert(auto ? 'Test submitted successfully' : 'Code submitted successfully');
      navigate(`/results/${session.id}`);
    } catch (error) {
      console.error('Failed to complete session:', error);
      alert('Failed to complete session');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleQuestionSelection = (index) => {
    if (!selectionPhase) return;

    if (selectedQuestionIndices.includes(index)) {
      setSelectedQuestionIndices(selectedQuestionIndices.filter((i) => i !== index));
    } else {
      if (selectedQuestionIndices.length >= 2) {
        alert('You can select only 2 questions for the coding test.');
        return;
      }
      setSelectedQuestionIndices([...selectedQuestionIndices, index]);
    }
  };

  const startCodingTestWithSelectedQuestions = () => {
    if (selectedQuestionIndices.length !== 2) {
      alert('Please select exactly 2 questions to start the test.');
      return;
    }
    setSelectionPhase(false);
    // Reset to the first selected question
    setCurrentQuestionIndex(0);
    const questionsForTest = getActiveQuestions([
      ...selectedQuestionIndices,
    ]);
    setCode(questionsForTest[0]?.reference_solution || '');
  };

  const getActiveQuestions = (overrideSelection) => {
    if (!session) return [];
    const indices =
      !selectionPhase && (overrideSelection || selectedQuestionIndices).length > 0
        ? overrideSelection || selectedQuestionIndices
        : session.questions.map((_, idx) => idx);

    return indices.map((i) => session.questions[i]);
  };


  if (loading || !session) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">Loading...</div>
      </div>
    );
  }

  const questionsForTest = getActiveQuestions();
  const currentQuestion = questionsForTest[currentQuestionIndex];
  const visibleTestCases = currentQuestion.test_cases?.filter((tc) => !tc.is_hidden) || [];
  const hiddenTestCases = currentQuestion.test_cases?.filter((tc) => tc.is_hidden) || [];
  const currentTestResults = testResultsByQuestion[currentQuestionIndex] || [];

  const getTestCaseStatus = (testCaseId) => {
    const result = currentTestResults.find((r) => r.test_case_id === testCaseId);
    if (!result) return 'pending';
    return result.passed ? 'passed' : 'failed';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex">
        <div className="flex-1 p-6">
          {/* Question selection row */}
          <div className="mb-4 flex gap-2 flex-wrap">
            {session.questions.map((q, index) => {
              const isSelected = selectedQuestionIndices.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (selectionPhase) {
                      toggleQuestionSelection(index);
                    } else {
                      setCurrentQuestionIndex(index);
                      setCode(q.reference_solution || '');
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium border ${
                    index === currentQuestionIndex && !selectionPhase
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isSelected
                      ? 'bg-green-100 text-green-700 border-green-400'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  Q{index + 1}
                  {selectionPhase && isSelected && (
                    <Check className="inline ml-1" size={16} />
                  )}
                </button>
              );
            })}

            {selectionPhase && (
              <button
                onClick={startCodingTestWithSelectedQuestions}
                className="ml-auto px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Start Coding Test (Select 2)
              </button>
            )}
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
              {/* Sample Input / Output */}
              {(currentQuestion.input_format || currentQuestion.output_format) && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.input_format && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Sample Input</h3>
                      <pre className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                        {currentQuestion.input_format}
                      </pre>
                    </div>
                  )}
                  {currentQuestion.output_format && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Sample Output</h3>
                      <pre className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap">
                        {currentQuestion.output_format}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <h3 className="font-semibold text-gray-800 mb-2">Test Cases:</h3>
              <div className="space-y-2">
                {visibleTestCases.map((tc, index) => {
                  const status = getTestCaseStatus(tc.id);
                  return (
                    <div
                      key={tc.id}
                      className={`p-3 rounded border text-sm ${
                        status === 'passed'
                          ? 'border-green-500 bg-green-50'
                          : status === 'failed'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          Test Case {index + 1}
                        </span>
                        {status === 'passed' && (
                          <Check className="text-green-600" size={18} />
                        )}
                        {status === 'failed' && (
                          <X className="text-red-600" size={18} />
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Input:</span>
                          <pre className="mt-1 text-gray-700 whitespace-pre-wrap">
                            {tc.input_data}
                          </pre>
                        </div>
                        <div>
                          <span className="font-medium">Expected Output:</span>
                          <pre className="mt-1 text-gray-700 whitespace-pre-wrap">
                            {tc.expected_output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {hiddenTestCases.map((tc, index) => (
                  <div
                    key={tc.id}
                    className="p-3 rounded border border-gray-300 bg-gray-100 flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">
                      Hidden Test Case {visibleTestCases.length + index + 1}
                    </span>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Lock size={16} />
                      <span>Locked</span>
                    </div>
                  </div>
                ))}
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
              <div className="text-lg font-semibold text-gray-800">
                {formatTime(timeLeft)}
              </div>
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
              <button
                onClick={() => handleFinish(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={18} />
                Finish Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;

