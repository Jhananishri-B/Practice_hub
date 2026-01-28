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
    // Store user code for each question: { [questionIndex]: codeString }
    const [userCodeByQuestion, setUserCodeByQuestion] = useState({});
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
                    replace: true
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

            // Initialize code for the first question - start with empty code
            setCode('');
            setUserCodeByQuestion({ 0: '' });

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
            const shouldFinish = window.confirm('Are you sure you want to finish the test? Your current code will be submitted.');
            if (!shouldFinish) {
                return;
            }

            // Auto-submit current code
            const currentQ = session.questions[currentQuestionIndex];
            if (code && code.trim()) {
                try {
                    await api.post(`/sessions/${session.id}/submit`, {
                        questionId: currentQ.question_id,
                        code,
                        language,
                    });
                } catch (e) {
                    console.warn("Failed to auto-submit final code", e);
                }
            }
        } else {
            setAutoSubmitted(true);
        }

        try {
            await api.post(`/sessions/${session.id}/complete`);
            // Only show alert if it's auto-submit, otherwise just navigate for smoother UX
            if (auto) alert('Test submitted successfully');

            // Force navigation and replace history to prevent going back
            navigate(`/results/${session.id}`, { replace: true });
        } catch (error) {
            console.error('Failed to complete session:', error);
            // Even if backend fails (e.g. already completed), try to navigate to results
            navigate(`/results/${session.id}`, { replace: true });
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
                                        // Save current code before switching
                                        setUserCodeByQuestion(prev => ({
                                            ...prev,
                                            [currentQuestionIndex]: code
                                        }));

                                        setCurrentQuestionIndex(index);

                                        // Load saved code or start with empty code
                                        const savedCode = userCodeByQuestion[index];
                                        setCode(savedCode !== undefined ? savedCode : '');

                                        // Clear results when switching questions
                                        setSubmitResult(null);
                                        setOutput('');
                                        setLastRunError(null);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium border ${index === currentQuestionIndex
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    Q{index + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-4 border border-transparent dark:border-slate-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{currentQuestion.title}</h2>
                        <div className="prose dark:prose-invert max-w-none mb-4">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentQuestion.description}</p>
                        </div>

                        {currentQuestion.constraints && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Constraints:</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">{currentQuestion.constraints}</p>
                            </div>
                        )}

                        <div className="mt-6">
                            {/* Sample Input / Output */}
                            {(currentQuestion.input_format || currentQuestion.output_format) && (
                                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentQuestion.input_format && (
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Sample Input</h3>
                                            <pre className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {currentQuestion.input_format}
                                            </pre>
                                        </div>
                                    )}
                                    {currentQuestion.output_format && (
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Sample Output</h3>
                                            <pre className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {currentQuestion.output_format}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Test Cases:</h3>
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
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 test-case-passed'
                                                : status === 'failed'
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 test-case-failed'
                                                    : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    Test Case {index + 1}
                                                </span>
                                                {status === 'passed' && (
                                                    <Check className="text-green-600 dark:text-green-400" size={18} />
                                                )}
                                                {status === 'failed' && (
                                                    <X className="text-red-600 dark:text-red-400" size={18} />
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <span className="font-medium text-gray-600 dark:text-gray-400">Input:</span>
                                                    <pre className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-1 rounded">
                                                        {tc.input_data}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600 dark:text-gray-400">Expected Output:</span>
                                                    <pre className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-1 rounded">
                                                        {tc.expected_output}
                                                    </pre>
                                                </div>
                                                {result && !result.passed && (
                                                    <div className="md:col-span-2">
                                                        <span className="font-medium text-red-600 dark:text-red-400">Actual Output:</span>
                                                        <pre className="mt-1 text-red-700 dark:text-red-300 whitespace-pre-wrap bg-red-50/50 dark:bg-red-900/20 p-1 rounded">
                                                            {result.actual_output || 'No output'}
                                                        </pre>
                                                        {result.error_message && (
                                                            <div className="mt-1 text-red-600 dark:text-red-400 text-xs">
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
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : status === 'failed'
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                    : 'border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700'
                                                }`}
                                        >
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                Hidden Test Case {visibleTestCases.length + index + 1}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {status === 'passed' && (
                                                    <>
                                                        <Check className="text-green-600 dark:text-green-400" size={16} />
                                                        <span className="text-green-600 dark:text-green-400 text-sm">Passed</span>
                                                    </>
                                                )}
                                                {status === 'failed' && (
                                                    <>
                                                        <X className="text-red-600 dark:text-red-400" size={16} />
                                                        <span className="text-red-600 dark:text-red-400 text-sm">Failed</span>
                                                    </>
                                                )}
                                                {status === 'pending' && (
                                                    <>
                                                        <Lock size={16} className="text-gray-600 dark:text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-400">Locked</span>
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

                <div className="w-full md:w-1/2 bg-white dark:bg-slate-800 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-700 flex flex-col h-[500px] md:h-auto transition-colors duration-300">
                    {/* Top Bar: Timer, Run, Submit, Finish Test */}
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time:</span>
                                <span className="text-lg font-semibold text-gray-800 dark:text-white font-mono">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRun}
                                disabled={isRunning}
                                className={`flex items-center justify-center p-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={isRunning ? 'Running...' : 'Run'}
                            >
                                {isRunning ? (
                                    <div className="w-5 h-5 border-2 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Play size={20} />
                                )}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isRunning}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <Send size={18} />
                                Submit
                            </button>
                            <button
                                onClick={() => handleFinish(false)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                <CheckCircle size={18} />
                                Finish Test
                            </button>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1" style={{ minHeight: '400px' }}>
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={(value) => {
                                setCode(value || '');
                                // Update persistent state as user types (debouncing could be added if performance issues arise)
                                setUserCodeByQuestion(prev => ({
                                    ...prev,
                                    [currentQuestionIndex]: value || ''
                                }));
                            }}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                cursorBlinking: 'smooth',
                                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                            }}
                        />
                    </div>

                    {/* Terminal/Input Area - Enlarged */}
                    <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-900 flex flex-col" style={{ minHeight: '200px', maxHeight: '300px' }}>
                        <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Custom Input Terminal</span>
                                <label className="flex items-center gap-2 ml-4">
                                    <input
                                        type="checkbox"
                                        checked={useCustomInput}
                                        onChange={(e) => setUseCustomInput(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                    />
                                    <span className="text-sm text-gray-400">Enable custom input</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex-1 p-4">
                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder={useCustomInput ? "Enter your custom input here..." : "Enable custom input to enter test data..."}
                                disabled={!useCustomInput}
                                className="w-full h-full px-4 py-3 bg-gray-800 text-green-400 font-mono text-sm rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ minHeight: '150px' }}
                            />
                        </div>
                    </div>

                    {/* Bottom Section: Results and Output */}
                    <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-4 bg-white dark:bg-slate-800 transition-colors duration-300">

                        {/* LeetCode-style Submit Result Panel */}
                        {submitResult && (
                            <div className={`p-4 rounded-lg border-l-4 ${submitResult.status === 'Accepted'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-lg font-bold ${submitResult.status === 'Accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {submitResult.status}
                                    </span>
                                    {submitResult.runtime && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Runtime: {submitResult.runtime}ms
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">{submitResult.passed}</span> / <span>{submitResult.total}</span> test cases passed
                                </div>
                                <button
                                    onClick={() => setSubmitResult(null)}
                                    className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* Console Output */}
                        {(output || lastRunError) && (
                            <div className="p-3 bg-gray-900 text-white rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
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
