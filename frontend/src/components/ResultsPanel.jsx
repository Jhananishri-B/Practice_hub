import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ResultsPanel({ result }) {
    if (!result) return null;

    const {
        passed,
        finalScore = 0,
        domScore = 0,
        pixelScore = 0,
        domChecks = [],
        message
    } = result;

    const getStatusIcon = (passed) => {
        if (passed) return <CheckCircle className="text-green-500" size={20} />;
        return <XCircle className="text-red-500" size={20} />;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg border-2 ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3">
                    {getStatusIcon(passed)}
                    <div>
                        <h3 className={`font-bold ${passed ? 'text-green-800' : 'text-red-800'}`}>
                            {passed ? 'Challenge Passed!' : 'Challenge Not Passed'}
                        </h3>
                        {message && (
                            <p className="text-sm text-gray-600 mt-1">{message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(finalScore)}`}>
                        {finalScore}%
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                        Final Score
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(domScore)}`}>
                        {domScore}%
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                        DOM Score
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(pixelScore)}`}>
                        {pixelScore}%
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                        Pixel Score
                    </div>
                </div>
            </div>

            {/* DOM Checks */}
            {domChecks && domChecks.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        DOM Checks ({domChecks.filter(c => c.passed).length}/{domChecks.length} passed)
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {domChecks.map((check, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-2 p-2 rounded text-sm ${check.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                    }`}
                            >
                                {check.passed ? (
                                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                                ) : (
                                    <XCircle size={14} className="text-red-500 shrink-0" />
                                )}
                                <span>{check.description || check.name || `Check ${index + 1}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
