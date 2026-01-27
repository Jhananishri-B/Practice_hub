import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Clock, CheckCircle, ChevronLeft, ChevronRight, RefreshCw, Check, Play, Trophy } from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import PreviewFrame from "../components/PreviewFrame";
import api from "../services/api";

export default function HtmlCssChallenge() {
    const { courseId, levelId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [session, setSession] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState({ html: "", css: "", js: "" });
    const [userCodeByQuestion, setUserCodeByQuestion] = useState({});
    const [expectedCode, setExpectedCode] = useState({ html: "", css: "", js: "" });
    const [expectedCodeByQuestion, setExpectedCodeByQuestion] = useState({});
    const [assetsByQuestion, setAssetsByQuestion] = useState({});
    const [previewTab, setPreviewTab] = useState("live");
    const [showInstructions, setShowInstructions] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaveTime, setLastSaveTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(3600);
    const [autoSubmitted, setAutoSubmitted] = useState(false);

    const previewRef = useRef();
    const expectedPreviewRef = useRef();
    const [fullScreenView, setFullScreenView] = useState(null);

    // Start session on mount - same as existing practice page
    useEffect(() => {
        startSession();
    }, [courseId, levelId]);

    // Timer countdown
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

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!session?.questions?.length) return;

        const autoSaveInterval = setInterval(() => {
            autoSaveProgress();
        }, 30000);

        return () => clearInterval(autoSaveInterval);
    }, [session, code, userCodeByQuestion]);

    const startSession = async () => {
        try {
            const sessionTypeFromState = location.state?.sessionType || 'coding';
            const response = await api.post('/sessions/start', {
                courseId,
                levelId,
                sessionType: sessionTypeFromState,
            });
            const sessionData = response.data;

            // If no questions, show message and go back
            if (!sessionData.questions || sessionData.questions.length === 0) {
                alert('No questions available for this level. Please add questions before starting a session.');
                navigate(`/courses/${courseId}/levels`);
                return;
            }

            setSession(sessionData);

            // Initialize code and expected code for the first question
            const firstQuestion = sessionData.questions[0];

            // Parse user initial code (empty for users to write)
            const initialCode = {
                html: '',
                css: '',
                js: ''
            };
            setCode(initialCode);
            setUserCodeByQuestion({ 0: initialCode });

            // Parse expected code from reference_solution (stored as JSON)
            const expectedCodeMap = {};
            const assetsMap = {};
            sessionData.questions.forEach((q, idx) => {
                let expected = { html: '', css: '', js: '' };
                if (q.reference_solution) {
                    try {
                        const parsed = JSON.parse(q.reference_solution);
                        expected = {
                            html: parsed.html || '',
                            css: parsed.css || '',
                            js: parsed.js || ''
                        };
                    } catch (e) {
                        // If not JSON, might be plain HTML
                        expected = { html: q.reference_solution, css: '', js: '' };
                    }
                }
                expectedCodeMap[idx] = expected;

                // Parse Assets from output_format
                let assets = [];
                if (q.output_format) {
                    try {
                        const parsedAssets = JSON.parse(q.output_format);
                        if (Array.isArray(parsedAssets)) {
                            assets = parsedAssets;
                        }
                    } catch (e) {
                        const assetsList = q.output_format.split(',').map(item => {
                            const parts = item.trim().split('|');
                            const rawPath = parts[1] || parts[0] || '';
                            // Normalize path: replace backslashes with forward slashes
                            const normalizedPath = rawPath.replace(/\\/g, '/');
                            return {
                                name: parts[0] || '',
                                path: normalizedPath
                            };
                        }).filter(a => a.name);
                        if (assetsList.length > 0) assets = assetsList;
                    }
                }
                assetsMap[idx] = assets;
            });

            setExpectedCodeByQuestion(expectedCodeMap);
            setAssetsByQuestion(assetsMap);
            setExpectedCode(expectedCodeMap[0] || { html: '', css: '', js: '' });

            setLoading(false);
        } catch (error) {
            console.error('Failed to start session:', error);
            const errorMessage = error?.response?.data?.error || error?.message || 'Failed to start practice session';
            alert(`Failed to start practice session: ${errorMessage}`);
            setLoading(false);
            navigate(`/courses/${courseId}/levels`);
        }
    };

    const autoSaveProgress = async () => {
        if (isSaving) return;
        setIsSaving(true);

        // Save current code to localStorage
        const storageKey = `htmlcss_${courseId}_${levelId}`;
        localStorage.setItem(storageKey, JSON.stringify({
            code,
            userCodeByQuestion,
            currentQuestionIndex
        }));

        setLastSaveTime(new Date());
        setIsSaving(false);
    };

    const handleQuestionChange = (index) => {
        // Save current code before switching
        setUserCodeByQuestion(prev => ({
            ...prev,
            [currentQuestionIndex]: code
        }));

        setCurrentQuestionIndex(index);

        // Load saved code or start with empty code
        const savedCode = userCodeByQuestion[index];
        if (savedCode) {
            setCode(savedCode);
        } else {
            // Start with empty code for user to write
            setCode({
                html: '',
                css: '',
                js: ''
            });
        }

        // Load expected code for this question
        setExpectedCode(expectedCodeByQuestion[index] || { html: '', css: '', js: '' });

        setPreviewTab("live");
    };

    const handleRunCode = () => {
        if (previewRef.current) {
            previewRef.current.updatePreview(code);
        }
    };

    const handleSubmit = async () => {
        if (!session) return;

        const currentQuestion = session.questions[currentQuestionIndex];
        if (!code.html?.trim() && !code.js?.trim()) {
            alert('Please write some code before submitting');
            return;
        }

        try {
            setIsSaving(true);

            // Submit code for this question
            await api.post(`/sessions/${session.id}/submit`, {
                questionId: currentQuestion.question_id,
                code: JSON.stringify(code),
                language: 'html', // Mark as HTML/CSS submission
            });

            // Save to user code
            setUserCodeByQuestion(prev => ({
                ...prev,
                [currentQuestionIndex]: { ...code, submitted: true }
            }));

            setLastSaveTime(new Date());
            alert('Code saved successfully!');
        } catch (error) {
            console.error('Failed to submit:', error);
            alert('Failed to save code. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinish = async (auto = false) => {
        if (!session) return;

        if (!auto) {
            const shouldFinish = window.confirm('Are you sure you want to finish the test?');
            if (!shouldFinish) return;
        } else {
            setAutoSubmitted(true);
        }

        try {
            await api.post(`/sessions/${session.id}/complete`);
            if (auto) alert('Test submitted successfully');

            // Clear localStorage
            const storageKey = `htmlcss_${courseId}_${levelId}`;
            localStorage.removeItem(storageKey);

            // Navigate to results
            navigate(`/results/${session.id}`, { replace: true });
        } catch (error) {
            console.error('Failed to complete session:', error);
            navigate(`/results/${session.id}`, { replace: true });
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (loading || !session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Challenge...</p>
            </div>
        );
    }

    const currentQuestion = session.questions[currentQuestionIndex];
    const currentAssets = assetsByQuestion[currentQuestionIndex] || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">{currentQuestion.title || 'HTML/CSS Challenge'}</h1>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-mono rounded border border-slate-200">
                                    Level {levelId} - Q{currentQuestionIndex + 1}
                                </span>
                            </div>
                            <p className="text-gray-600">
                                {session.questions.length > 1 &&
                                    `Question ${currentQuestionIndex + 1} of ${session.questions.length}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div
                                className={`px-3 py-2 rounded border font-mono font-bold flex items-center gap-2 ${timeLeft <= 300
                                    ? "bg-red-50 border-red-300 text-red-600"
                                    : "bg-blue-50 border-blue-300 text-blue-600"
                                    }`}
                            >
                                <Clock size={16} /> {formatTime(timeLeft)}
                            </div>

                            {session.questions.length > 1 && (
                                <div className="flex gap-2">
                                    {session.questions.map((q, index) => {
                                        const isSubmitted = userCodeByQuestion[index]?.submitted;
                                        return (
                                            <button
                                                key={q.question_id}
                                                onClick={() => handleQuestionChange(index)}
                                                className={`w-10 h-10 rounded flex items-center justify-center font-semibold ${index === currentQuestionIndex
                                                    ? "bg-blue-600 text-white ring-2 ring-blue-300"
                                                    : isSubmitted
                                                        ? "bg-green-500 text-white"
                                                        : "bg-gray-200 text-gray-700"
                                                    }`}
                                                title={`Question ${index + 1}`}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => navigate(`/courses/${courseId}/levels`)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                        >
                            <ChevronLeft size={18} />
                            Back to Levels
                        </button>

                        {session.questions.length > 1 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleQuestionChange(currentQuestionIndex - 1)}
                                    disabled={currentQuestionIndex === 0}
                                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                <button
                                    onClick={() => handleQuestionChange(currentQuestionIndex + 1)}
                                    disabled={currentQuestionIndex === session.questions.length - 1}
                                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleRunCode}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2"
                        >
                            <Play size={18} />
                            Run Code
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCw size={20} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Save Progress
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
                        >
                            <CheckCircle size={20} />
                            Submit Code
                        </button>

                        <button
                            onClick={() => handleFinish(false)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
                        >
                            <Trophy size={20} />
                            Finish Test
                        </button>

                        {lastSaveTime && (
                            <span className="text-xs text-slate-400 self-center">
                                Saved {lastSaveTime.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content - Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6" style={{ height: "calc(100vh - 180px)" }}>
                {/* Left Panel: Instructions & Code Editor */}
                <div className="flex flex-col gap-4 overflow-auto">
                    {/* Toggle Instructions */}
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="flex items-center justify-between px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <span className="font-semibold">
                            {showInstructions ? "📖 Hide Instructions" : "📖 Show Instructions"}
                        </span>
                        <svg
                            className={`w-5 h-5 transition-transform ${showInstructions ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Instructions */}
                    {showInstructions && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-3">
                                {currentQuestion.title || "Challenge Instructions"}
                            </h2>
                            <div className="text-gray-700 whitespace-pre-wrap mb-4">
                                {currentQuestion.description}
                            </div>

                            {/* Constraints */}
                            {currentQuestion.constraints && (
                                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <h3 className="font-semibold text-orange-900 mb-2">Constraints:</h3>
                                    <p className="text-sm text-orange-800">{currentQuestion.constraints}</p>
                                </div>
                            )}

                            {/* Assets Section */}
                            {currentAssets.length > 0 && (
                                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                        <h3 className="font-semibold text-purple-900">Description</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {currentAssets.map((asset, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-purple-100">
                                                <span className="text-purple-700 font-medium text-sm">{asset.name}</span>
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{asset.path}</code>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Output Format - Hide Output if it contains assets */}
                            {currentQuestion.output_format && currentAssets.length === 0 && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h3 className="font-semibold text-green-900 mb-2">Sample Output:</h3>
                                    <pre className="text-sm text-green-800 whitespace-pre-wrap">{currentQuestion.output_format}</pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Code Editor */}
                    <div
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1"
                        style={!showInstructions ? { minHeight: "calc(100vh - 250px)" } : {}}
                    >
                        <CodeEditor code={code} onChange={setCode} />
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div className="flex flex-col h-full overflow-hidden relative">
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                            <div className="p-3 border-b flex flex-wrap gap-3 items-center justify-between bg-gray-50 rounded-t-xl">
                                <div className="inline-flex rounded-md border bg-white p-1 shadow-sm">
                                    <button
                                        onClick={() => setPreviewTab("live")}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${previewTab === "live"
                                            ? "bg-blue-600 text-white shadow"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        Live Preview
                                    </button>
                                    <button
                                        onClick={() => setPreviewTab("expected")}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${previewTab === "expected"
                                            ? "bg-green-600 text-white shadow"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        Expected Result
                                    </button>
                                </div>
                                <button
                                    onClick={() => setFullScreenView(previewTab)}
                                    className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-1"
                                >
                                    ⤢ Full Screen
                                </button>
                            </div>
                            <div className="flex-1 relative overflow-auto bg-gray-100">
                                {previewTab === "live" ? (
                                    <PreviewFrame ref={previewRef} code={code} />
                                ) : (
                                    // Show expected result preview with the admin-defined expected code
                                    expectedCode.html || expectedCode.css || expectedCode.js ? (
                                        <PreviewFrame ref={expectedPreviewRef} code={expectedCode} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-sm text-gray-500 p-8">
                                            <div className="text-center">
                                                <p className="mb-2">Expected design preview will be shown here when available.</p>
                                                <p className="text-xs text-gray-400">Compare your output with the expected result to verify your solution.</p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Screen Modal */}
            {fullScreenView && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    <div className={`p-4 border-b flex justify-between items-center ${fullScreenView === "expected" ? "bg-green-50" : "bg-gray-50"}`}>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {fullScreenView === "live" ? "🖥️ Live Preview (Full Screen)" : "✅ Expected Result (Full Screen)"}
                        </h2>
                        <button
                            onClick={() => setFullScreenView(null)}
                            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Exit Full Screen
                        </button>
                    </div>
                    <div className="flex-1 relative bg-gray-100 overflow-hidden p-4">
                        <div className="h-full w-full bg-white shadow-xl rounded-lg overflow-hidden border">
                            {/* Show live preview or expected result based on mode */}
                            <PreviewFrame
                                ref={fullScreenView === "expected" ? expectedPreviewRef : previewRef}
                                code={fullScreenView === "expected" ? expectedCode : code}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
