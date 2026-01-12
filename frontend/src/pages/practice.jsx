import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { Play, Send, CheckCircle, Lock, Check, X } from 'lucide-react';

// Course-to-language mapping (must match backend validation)
const COURSE_LANGUAGE_MAP = {
    'Python': [{ value: 'python', label: 'Python 3.10' }],
    'Machine Learning': [{ value: 'python', label: 'Python 3.10' }],
    'Data Science': [{ value: 'python', label: 'Python 3.10' }],
    'Deep Learning': [{ value: 'python', label: 'Python 3.10' }],
    'Cloud Computing': [{ value: 'python', label: 'Python 3.10' }],
    'C Programming': [{ value: 'c', label: 'C (GCC)' }],
};

// Get available languages for a course
const getLanguagesForCourse = (courseTitle) => {
    return COURSE_LANGUAGE_MAP[courseTitle] || [{ value: 'python', label: 'Python 3.10' }];
};

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
    const [testResultsByQuestion, setTestResultsByQuestion] = useState({});
    const [output, setOutput] = useState('');
    const [lastRunError, setLastRunError] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [availableLanguages, setAvailableLanguages] = useState([{ value: 'python', label: 'Python 3.10' }]);
    // LeetCode-style result state
    const [submitResult, setSubmitResult] = useState(null); // { status: 'Accepted'|'Wrong Answer'|'Runtime Error'|'Time Limit Exceeded', passed: number, total: number, runtime?: number }

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

            // Set available languages based on course
            const courseLanguages = getLanguagesForCourse(sessionData.course_title);
            setAvailableLanguages(courseLanguages);

            // Auto-select the first (and usually only) language for this course
            if (courseLanguages.length > 0) {
                setLanguage(courseLanguages[0].value);
            }

            setSession(sessionData);
            setCode(sessionData.questions[0]?.reference_solution || '');
            setLoading(false);
        } catch (error) {
            console.error('Failed to start session:', error);
            const errorMessage = error?.response?.data?.error || error?.message || 'Failed to start practice session';
            console.error('Error details:', error?.response?.data);
            alert(`Failed to start practice session: ${errorMessage}`);
            setLoading(false);
        }
    };

    const handleRun = async () => {
        if (!code.trim()) {
            alert('Please write some code before running');
            return;
        }

        const input = useCustomInput ? customInput : '';
        setIsRunning(true);
        setOutput('');
        setLastRunError(null);

        try {
            let response;

            if (useCustomInput) {
                // Run with custom input (Execution only)
                response = await api.post(`/sessions/${session.id}/run`, {
                    code,
                    language,
                    customInput: input
                });
                const { output, error } = response.data;
                setOutput(output || '');
                setLastRunError(error || null);
            } else {
                // Run against Visible Test Cases (Validation)
                // Find current question ID
                const activeQuestions = getActiveQuestions();
                const currentQ = activeQuestions[currentQuestionIndex];

                response = await api.post(`/sessions/${session.id}/run-tests`, {
                    code,
                    language,
                    questionId: currentQ.question_id
                });

                // Update Test Results
                if (response.data.test_results) {
                    setTestResultsByQuestion((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: response.data.test_results,
                    }));

                    // Also show a summary in console output area?
                    const passed = response.data.test_results.filter(r => r.passed).length;
                    const total = response.data.test_results.length;
                    setOutput(`Run Results: ${passed}/${total} visible test cases passed.\nSee detailed status above.`);
                    setLastRunError(null);
                } else {
                    setOutput("No visible test cases to run.");
                }
            }
        } catch (error) {
            console.error('Failed to run code:', error);
            const msg = error.response?.data?.error || 'Failed to execute code.';
            setLastRunError(msg);
            // Also show specific alert if it's language issue
            if (msg.includes('Invalid language')) {
                alert('Please use the correct programming language for this course!');
            }
        } finally {
            setIsRunning(false);
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

            // LeetCode-style result display
            const passed = response.data.test_cases_passed || 0;
            const total = response.data.total_test_cases || 0;

            if (response.data.is_correct) {
                setSubmitResult({
                    status: 'Accepted',
                    passed,
                    total,
                    runtime: response.data.execution_time,
                });
            } else {
                // Categorize the error type
                const hasRuntimeError = response.data.test_results?.some(r => r.error_message && !r.error_message.includes('Time'));
                const hasTimeLimit = response.data.test_results?.some(r => r.error_message?.includes('Time'));

                setSubmitResult({
                    status: hasTimeLimit ? 'Time Limit Exceeded' : hasRuntimeError ? 'Runtime Error' : 'Wrong Answer',
                    passed,
                    total,
                });
            }

            // Don't auto-advance to next question - let user see their result first
            // User can manually navigate when ready
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

    const getActiveQuestions = () => {
        return session?.questions || [];
    };


    if (loading || !session) {
        return (
            <Layout>
                <div className="p-8">Loading...</div>
            </Layout>
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
        <Layout>
            <div className="flex-1 flex flex-col md:flex-row pb-20 md:pb-0 h-full">
                <div className="w-full md:flex-1 p-6 overflow-y-auto">
                    {/* Question selection row */}
                    <div className="mb-4 flex gap-2 flex-wrap">
                        {session.questions.map((q, index) => {
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentQuestionIndex(index);
                                        // Preserve code if moving back? For now, load ref
                                        // Ideally we should store user code per question in state
                                        // But for now, let's just warn or simple switch
                                        // Assuming user code is shared or wiped? 
                                        // actually existing logic wiped it: setCode(q.reference || '')
                                        // We should allow navigation.
                                        const confirmSwitch = code !== (q.reference_solution || '') ? window.confirm("Switching questions will discard unsaved code (unless we save it). Continue?") : true;
                                        if (confirmSwitch) {
                                            setCode(q.reference_solution || '');
                                            // Clear results when switching questions
                                            setSubmitResult(null);
                                            setOutput('');
                                            setLastRunError(null);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium border ${index === currentQuestionIndex
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                        }`}
                                >
                                    Q{index + 1}
                                </button>
                            );
                        })}
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
                            <style>{`
            @keyframes blink-green {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @keyframes blink-red {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .test-case-passed {
              animation: blink-green 1s ease-in-out 3;
            }
            .test-case-failed {
              animation: blink-red 1s ease-in-out 3;
            }
          `}</style>
                            <div className="space-y-2">
                                {visibleTestCases.map((tc, index) => {
                                    const status = getTestCaseStatus(tc.id);
                                    const result = currentTestResults.find((r) => r.test_case_id === tc.id);
                                    return (
                                        <div
                                            key={tc.id}
                                            className={`p-3 rounded border text-sm ${status === 'passed'
                                                ? 'border-green-500 bg-green-50 test-case-passed'
                                                : status === 'failed'
                                                    ? 'border-red-500 bg-red-50 test-case-failed'
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
                                                {result && !result.passed && (
                                                    <div className="md:col-span-2">
                                                        <span className="font-medium text-red-600">Actual Output:</span>
                                                        <pre className="mt-1 text-red-700 whitespace-pre-wrap">
                                                            {result.actual_output || 'No output'}
                                                        </pre>
                                                        {result.error_message && (
                                                            <div className="mt-1 text-red-600 text-xs">
                                                                Error: {result.error_message}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {hiddenTestCases.map((tc, index) => {
                                    const status = getTestCaseStatus(tc.id);
                                    return (
                                        <div
                                            key={tc.id}
                                            className={`p-3 rounded border flex items-center justify-between text-sm ${status === 'passed'
                                                ? 'border-green-500 bg-green-50'
                                                : status === 'failed'
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-300 bg-gray-100'
                                                }`}
                                        >
                                            <span className="font-medium">
                                                Hidden Test Case {visibleTestCases.length + index + 1}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {status === 'passed' && (
                                                    <>
                                                        <Check className="text-green-600" size={16} />
                                                        <span className="text-green-600 text-sm">Passed</span>
                                                    </>
                                                )}
                                                {status === 'failed' && (
                                                    <>
                                                        <X className="text-red-600" size={16} />
                                                        <span className="text-red-600 text-sm">Failed</span>
                                                    </>
                                                )}
                                                {status === 'pending' && (
                                                    <>
                                                        <Lock size={16} className="text-gray-600" />
                                                        <span className="text-gray-600">Locked</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col h-[500px] md:h-auto">
                    <div className="p-4 border-b border-gray-200">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            {availableLanguages.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                cursorBlinking: 'smooth',
                                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
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
                                disabled={isRunning}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Play size={18} />
                                {isRunning ? 'Running...' : 'Run'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isRunning}
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

                        {/* LeetCode-style Submit Result Panel */}
                        {submitResult && (
                            <div className={`mt-4 p-4 rounded-lg border-l-4 ${submitResult.status === 'Accepted'
                                ? 'bg-green-50 border-green-500'
                                : 'bg-red-50 border-red-500'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-lg font-bold ${submitResult.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {submitResult.status}
                                    </span>
                                    {submitResult.runtime && (
                                        <span className="text-sm text-gray-500">
                                            Runtime: {submitResult.runtime}ms
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-700">
                                    <span className="font-medium">{submitResult.passed}</span> / <span>{submitResult.total}</span> test cases passed
                                </div>
                                <button
                                    onClick={() => setSubmitResult(null)}
                                    className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* Console Output */}
                        {(output || lastRunError) && (
                            <div className="mt-4 p-3 bg-gray-900 text-white rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
                                <div className="flex justify-between items-center mb-1 border-b border-gray-700 pb-1">
                                    <span className="text-gray-400 text-xs">Console Output</span>
                                    {lastRunError && <span className="text-red-400 text-xs text-right">Execution Error</span>}
                                </div>
                                <pre className="whitespace-pre-wrap">
                                    {lastRunError && <div className="text-red-400 mb-2">{lastRunError}</div>}
                                    {output}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>);
};

export default Practice;
