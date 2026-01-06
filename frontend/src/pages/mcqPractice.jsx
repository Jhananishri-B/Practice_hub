import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { ArrowRight, CheckCircle, MessageSquare, X, Sparkles } from 'lucide-react';

const MCQPractice = () => {
  const { courseId, levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [hint, setHint] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    startSession();
  }, [courseId, levelId]);

  useEffect(() => {
    if (!session) return;

    if (timeLeft <= 0 && !autoSubmitted) {
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
      const sessionTypeFromState = location.state?.sessionType || 'mcq';
      const response = await api.post('/sessions/start', {
        courseId,
        levelId,
        sessionType: sessionTypeFromState,
      });
      const sessionData = response.data;

      setSession(sessionData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start practice session');
    }
  };

  const handleOptionSelect = (optionId) => {
    if (submitted) return;
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestionIndex]: optionId,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSubmitted(false);
      setHint(null);
      setShowHint(false);
    }
  };

  const handleGetHint = async () => {
    if (hint) {
      setShowHint(true);
      return;
    }

    setLoadingHint(true);
    setShowHint(true);
    try {
      // In a real app we would have a specific endpoint for hints per question
      // reusing chat endpoint with a prompt
      const response = await api.post('/ai-tutor/chat', {
        sessionId: session.id,
        message: "Can you give me a hint for this question without telling me the answer?",
      });
      setHint(response.data.message);
    } catch (error) {
      console.error('Failed to get hint:', error);
      setHint("Sorry, I couldn't generate a hint right now. Try reviewing the concepts!");
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmit = async () => {
    if (!session) return;

    const currentQuestion = session.questions[currentQuestionIndex];
    const selectedOptionId = selectedOptions[currentQuestionIndex];

    if (!selectedOptionId) {
      alert('Please select an option');
      return;
    }

    try {
      await api.post(`/sessions/${session.id}/submit`, {
        questionId: currentQuestion.question_id,
        selected_option_id: selectedOptionId,
      });

      setSubmitted(true);

      if (currentQuestionIndex === session.questions.length - 1) {
        alert('You have answered all questions. You can review or finish the test.');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit answer');
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
      alert(auto ? 'Test submitted successfully' : 'Test submitted successfully');
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

  if (loading || !session) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">Loading...</div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const selectedOption = selectedOptions[currentQuestionIndex];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex">
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">QUESTIONS</h3>
          <div className="grid grid-cols-5 gap-2">
            {session.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setSubmitted(false);
                }}
                className={`w-10 h-10 rounded-lg font-medium ${index === currentQuestionIndex
                  ? 'bg-blue-600 text-white'
                  : selectedOptions[index]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  QUESTION {currentQuestionIndex + 1} OF {session.questions.length}
                </span>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-gray-800">
                    Time Left: {formatTime(timeLeft)}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === session.questions.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Question
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.title}</h2>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{currentQuestion.description}</p>

              {/* AI Hint Section */}
              <div className="mb-6">
                {!showHint ? (
                  <button
                    onClick={handleGetHint}
                    className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors"
                  >
                    <Sparkles size={16} />
                    Need a Hint? Ask AI
                  </button>
                ) : (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 relative animate-fade-in">
                    <div className="flex items-start gap-3">
                      <div className="bg-white p-1.5 rounded-full shadow-sm mt-1">
                        <Sparkles size={16} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-purple-800 mb-1">AI Coach Hint</h4>
                        {loadingHint ? (
                          <div className="flex gap-1 items-center h-5">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                          </div>
                        ) : (
                          <p className="text-sm text-purple-800 leading-relaxed">{hint}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowHint(false)}
                        className="text-purple-400 hover:text-purple-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedOption === option.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={() => handleOptionSelect(option.id)}
                      className="mt-1 mr-3"
                      disabled={submitted}
                    />
                    <span className="flex-1 text-gray-700">{option.option_text}</span>
                  </label>
                ))}
              </div>

              {submitted && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">Answer submitted!</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || submitted}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
              <button
                onClick={() => handleFinish(false)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Finish Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQPractice;

