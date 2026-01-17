import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { BookOpen, Code, Lightbulb, ExternalLink, ArrowRight, Sparkles, Loader, Edit, Save, Plus, X, Trash2, CheckCircle, FolderIcon } from 'lucide-react';

const LevelOverview = () => {
    const { courseId, levelId } = useParams();
    const navigate = useNavigate();
    const [lessonPlan, setLessonPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Edit State
    const [editData, setEditData] = useState({
        introduction: '',
        concepts: [],
        resources: [],
        key_terms: [],
        example_code: ''
    });

    useEffect(() => {
        // Check Admin Role
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setIsAdmin(user.role === 'admin');
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
        fetchLessonPlan();
    }, [courseId, levelId]);

    const fetchLessonPlan = async () => {
        try {
            // Fetch persistent user-curated/admin-curated content
            const response = await api.get(`/courses/${courseId}/levels/${levelId}`);
            setLessonPlan(response.data);
            setEditData({
                introduction: response.data.introduction || '',
                concepts: response.data.concepts || [],
                resources: response.data.resources || [],
                key_terms: response.data.key_terms || [],
                example_code: response.data.example_code || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch lesson plan:', error);
            setLoading(false);
            // Fallback content if empty or error
            if (!lessonPlan) {
                setLessonPlan({
                    introduction: "Content is being prepared for this level.",
                    concepts: [],
                    resources: [],
                    example_code: "// No example code available"
                });
            }
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                learning_materials: {
                    introduction: editData.introduction,
                    concepts: editData.concepts,
                    resources: editData.resources,
                    key_terms: editData.key_terms
                }
            };

            console.log('[LevelOverview] Saving payload:', payload);
            const response = await api.put(`/admin/levels/${levelId}/details`, payload);
            console.log('[LevelOverview] Save successful:', response.data);
            
            // Show success popup
            alert("✅ Changes saved successfully!");
            
            setIsEditing(false);
            fetchLessonPlan(); // Refresh
        } catch (error) {
            console.error("Failed to save level details", error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save changes';
            const errorDetails = error.response?.data?.details;
            console.error('[LevelOverview] Error details:', errorDetails);
            alert(`❌ Failed to save changes: ${errorMessage}`);
        }
    };

    const addConcept = () => {
        setEditData({
            ...editData,
            concepts: [...editData.concepts, { title: 'New Concept', explanation: 'Description here' }]
        });
    };

    const updateConcept = (idx, field, value) => {
        const newConcepts = [...editData.concepts];
        newConcepts[idx][field] = value;
        setEditData({ ...editData, concepts: newConcepts });
    };

    const removeConcept = (idx) => {
        const newConcepts = editData.concepts.filter((_, i) => i !== idx);
        setEditData({ ...editData, concepts: newConcepts });
    };

    const addResource = () => {
        setEditData({
            ...editData,
            resources: [...editData.resources, { title: 'New Resource', url: 'https://' }]
        });
    };

    const updateResource = (idx, field, value) => {
        const newResources = [...editData.resources];
        newResources[idx][field] = value;
        setEditData({ ...editData, resources: newResources });
    };

    const removeResource = (idx) => {
        const newResources = editData.resources.filter((_, i) => i !== idx);
        setEditData({ ...editData, resources: newResources });
    };

    const addKeyTerm = () => {
        const term = prompt('Enter key term:');
        if (term && term.trim()) {
            setEditData({
                ...editData,
                key_terms: [...editData.key_terms, term.trim()]
            });
        }
    };

    const removeKeyTerm = (idx) => {
        const newTerms = editData.key_terms.filter((_, i) => i !== idx);
        setEditData({ ...editData, key_terms: newTerms });
    };


    if (loading) {
        return (
            <Layout>
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <Sparkles className="text-purple-600 animate-pulse" size={32} />
                            <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Lesson Plan...</h2>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!lessonPlan) return null;

    return (
        <Layout>
            <div className="flex-1 p-8 pb-24 md:pb-8 overflow-y-auto relative font-sans">

                {/* Admin Float Button */}
                {isAdmin && (
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="fixed bottom-24 right-8 md:top-8 md:right-8 md:bottom-auto z-50 bg-black text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                        {isEditing ? <X size={24} /> : <Edit size={24} />}
                    </button>
                )}

                {/* Edit Mode Overlay */}
                {isEditing ? (
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-200 animate-in fade-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Edit Level Content</h2>
                            <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
                                <textarea
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                                    value={editData.introduction}
                                    onChange={(e) => setEditData({ ...editData, introduction: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Concepts</label>
                                    <button onClick={addConcept} className="text-sm text-purple-600 flex items-center gap-1 hover:underline"><Plus size={14} /> Add</button>
                                </div>
                                <div className="space-y-3">
                                    {editData.concepts.map((c, idx) => (
                                        <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    className="w-full p-2 border rounded"
                                                    placeholder="Title"
                                                    value={c.title}
                                                    onChange={(e) => updateConcept(idx, 'title', e.target.value)}
                                                />
                                                <textarea
                                                    className="w-full p-2 border rounded text-sm"
                                                    placeholder="Explanation"
                                                    value={c.explanation}
                                                    onChange={(e) => updateConcept(idx, 'explanation', e.target.value)}
                                                />
                                            </div>
                                            <button onClick={() => removeConcept(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Resources</label>
                                    <button onClick={addResource} className="text-sm text-purple-600 flex items-center gap-1 hover:underline"><Plus size={14} /> Add</button>
                                </div>
                                <div className="space-y-2">
                                    {editData.resources.map((r, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                className="flex-1 p-2 border rounded"
                                                placeholder="Title"
                                                value={r.title}
                                                onChange={(e) => updateResource(idx, 'title', e.target.value)}
                                            />
                                            <input
                                                className="flex-1 p-2 border rounded"
                                                placeholder="URL"
                                                value={r.url}
                                                onChange={(e) => updateResource(idx, 'url', e.target.value)}
                                            />
                                            <button onClick={() => removeResource(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Key Terms</label>
                                    <button onClick={addKeyTerm} className="text-sm text-purple-600 flex items-center gap-1 hover:underline"><Plus size={14} /> Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {editData.key_terms.map((term, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-gray-700 text-sm font-medium flex items-center gap-2">
                                            {term}
                                            <button onClick={() => removeKeyTerm(idx)} className="text-red-400 hover:text-red-600">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {editData.key_terms.length === 0 && (
                                        <span className="text-gray-400 text-sm italic">No key terms added yet</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Example Code</label>
                                <textarea
                                    className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm min-h-[200px] bg-slate-900 text-white"
                                    value={editData.example_code}
                                    onChange={(e) => setEditData({ ...editData, example_code: e.target.value })}
                                />
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
                        {/* Header Section */}
                        <div className="space-y-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-gray-500 hover:text-gray-900 text-sm flex items-center gap-2 transition-colors group"
                            >
                                <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} />
                                Back to Levels
                            </button>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-blue-600 tracking-wider uppercase">LEVEL {lessonPlan.level_number ?? levelId}</h3>
                                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                                            {lessonPlan.title || `Level ${levelId} Overview`}
                                        </h1>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                                    {lessonPlan.introduction}
                                </p>

                                {/* Key Terms */}
                                {lessonPlan.key_terms && lessonPlan.key_terms.length > 0 && (
                                    <div className="pt-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            Key Terms
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {lessonPlan.key_terms.map((term, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wide border border-gray-200">
                                                    {term}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Core Topics Grid */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                                </span>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">CORE TOPICS</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {lessonPlan.concepts.map((concept, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                            {/* Dynamic Icon based on index or content? Using generic icons for now */}
                                            {[<Code size={20} />, <Lightbulb size={20} />, <Sparkles size={20} />, <BookOpen size={20} />][idx % 4]}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{concept.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed flex-1">
                                            {concept.explanation.length > 80
                                                ? concept.explanation.substring(0, 80) + '...'
                                                : concept.explanation}
                                        </p>
                                    </div>
                                ))}
                                {lessonPlan.concepts.length === 0 && (
                                    <div className="col-span-4 text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                        No core topics defined yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lower Section: Materials & Assessment */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Left Col: Course Materials (Size: 4/12) */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FolderIcon className="text-gray-400" size={20} />
                                        <h3 className="font-bold text-gray-900 text-lg">Course Materials</h3>
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{lessonPlan.resources.length} ASSETS</span>
                                </div>

                                <div className="space-y-3">
                                    {lessonPlan.resources.map((res, idx) => (
                                        <a
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-blue-700 transition-colors">
                                                    {res.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 truncate">External Resource • Click to view</p>
                                            </div>
                                            <ExternalLink size={16} className="text-gray-300 group-hover:text-blue-400" />
                                        </a>
                                    ))}
                                    {lessonPlan.resources.length === 0 && (
                                        <div className="text-sm text-gray-500 italic p-4 bg-white rounded-xl border border-gray-100">
                                            No materials added.
                                        </div>
                                    )}

                                    {/* Hardcoded extras just to fill space if empty (optional, matches design which lists multiple) */}
                                    {lessonPlan.resources.length === 0 && (
                                        <div className="opacity-50 pointer-events-none grayscale">
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><Code size={20} /></div>
                                                <div><h4 className="font-bold text-gray-800 text-sm">Example Code Snippet</h4></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Col: Assessment (Size: 8/12 - actually 7/12 looks better, let's use flex-1) */}
                            <div className="lg:col-span-7">
                                <div className="bg-blue-600 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                                        <Sparkles size={300} />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none -mr-16 -mb-16"></div>

                                    {/* Content */}
                                    <div className="relative z-10 space-y-6">
                                        <span className="inline-block px-3 py-1 bg-blue-500/50 border border-blue-400/30 rounded-full text-xs font-bold tracking-wider uppercase">
                                            Assessment Ready
                                        </span>

                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                                Ready to Test Your Knowledge?
                                            </h2>
                                            <p className="text-blue-100 text-lg leading-relaxed max-w-lg">
                                                Validation is the final step of learning. Prove your proficiency
                                                in <strong>Level {lessonPlan.level_number ?? levelId}</strong> fundamentals and earn your certification badge.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto pt-10 relative z-10">
                                        <button
                                            onClick={() => navigate(`/mcq-practice/${courseId}/${levelId}`, { state: { sessionType: 'mcq' } })}
                                            className="bg-white text-blue-900 px-6 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center gap-3"
                                        >
                                            <CheckCircle size={20} className="text-blue-600" />
                                            <div className="text-left">
                                                <div className="text-xs text-gray-500 font-normal uppercase">Quiz</div>
                                                <div>Take MCQ Test</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/practice/${courseId}/${levelId}`, { state: { sessionType: 'coding' } })}
                                            className="bg-blue-500/40 backdrop-blur-sm border border-blue-400/30 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-500/50 transition-colors flex items-center justify-center gap-3"
                                        >
                                            <Code size={20} />
                                            <div className="text-left">
                                                <div className="text-xs text-blue-200 font-normal uppercase">Practice</div>
                                                <div>Start Coding</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

const LinkIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
);

export default LevelOverview;
