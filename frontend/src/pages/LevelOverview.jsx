import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { BookOpen, Code, Lightbulb, ExternalLink, ArrowRight, Sparkles, Loader, Edit, Save, Plus, X, Trash2 } from 'lucide-react';

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
        example_code: ''
    });

    useEffect(() => {
        // Check Admin Role
        const role = localStorage.getItem('user_role');
        setIsAdmin(role === 'admin');
        fetchLessonPlan();
    }, [courseId, levelId]);

    const fetchLessonPlan = async () => {
        try {
            const response = await api.post('/ai-tutor/generate-lesson', {
                courseId,
                levelId
            });
            setLessonPlan(response.data);
            setEditData({
                introduction: response.data.introduction || '',
                concepts: response.data.concepts || [],
                resources: response.data.resources || [],
                example_code: response.data.example_code || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch lesson plan:', error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                // description: editData.introduction, // Ensure this maps if needed, but current storage is single JSON
                learning_materials: {
                    introduction: editData.introduction,
                    concepts: editData.concepts,
                    resources: editData.resources,
                    key_terms: lessonPlan.key_terms || [] // Preserve if not editing
                },
                code_snippet: editData.example_code
            };

            await api.put(`/admin/levels/${levelId}/details`, payload);
            setIsEditing(false);
            fetchLessonPlan(); // Refresh
        } catch (error) {
            console.error("Failed to save level details", error);
            alert("Failed to save changes.");
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


    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <Sparkles className="text-purple-600 animate-pulse" size={32} />
                            <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Lesson Plan...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (!lessonPlan) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <div className="flex-1 p-8 pb-24 md:pb-8 overflow-y-auto relative">

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
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                        {/* VIEW MODE */}
                        <div className="mb-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-10 shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <BookOpen size={200} />
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-white/80 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
                            >
                                ← Back to Levels
                            </button>

                            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Level Overview</h1>
                            <p className="text-indigo-100 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                                {lessonPlan.introduction}
                            </p>
                        </div>

                        {/* Core Concepts */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Lightbulb className="text-yellow-500" /> Core Concepts
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {lessonPlan.concepts.map((concept, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">{concept.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{concept.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Example Code */}
                        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                            <div className="bg-slate-800/50 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
                                    <Code size={16} />
                                    <span>example.c</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/50"></span>
                                    <span className="w-3 h-3 rounded-full bg-green-500/50"></span>
                                </div>
                            </div>
                            <div className="p-8 overflow-x-auto">
                                <pre className="text-blue-100 font-mono text-sm leading-relaxed">
                                    {lessonPlan.example_code}
                                </pre>
                            </div>
                        </div>

                        {/* Resources & CTA - Staggered Layout */}
                        <div className="flex flex-col lg:flex-row gap-8 mt-12">
                            {/* Resources List */}
                            <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <LinkIcon size={18} /> Learning Resources
                                </h3>
                                <div className="space-y-3">
                                    {lessonPlan.resources.map((res, idx) => (
                                        <a
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-100"
                                        >
                                            <span className="text-gray-700 font-medium group-hover:text-blue-600 truncate mr-2">{res.title}</span>
                                            <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Card */}
                            <div className="flex-1 bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl flex flex-col justify-center">
                                <div className="absolute top-0 right-0 -m-8 opacity-20">
                                    <Code size={200} />
                                </div>

                                <h2 className="text-3xl font-bold mb-4 relative z-10">Start Your Practice</h2>
                                <p className="text-indigo-200 mb-8 max-w-md relative z-10">
                                    Ready to write some code? Launch the interactive environment to test your skills now.
                                </p>

                                <div className="flex flex-wrap gap-4 relative z-10">
                                    <button
                                        onClick={() => navigate(`/practice/${courseId}/${levelId}`, { state: { sessionType: 'coding' } })}
                                        className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg flex items-center gap-3"
                                    >
                                        <Code className="text-indigo-600" /> Start Coding
                                    </button>
                                    <button
                                        onClick={() => navigate(`/mcq-practice/${courseId}/${levelId}`, { state: { sessionType: 'mcq' } })}
                                        className="bg-indigo-800/50 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700/50 border border-indigo-400/30 transition-all flex items-center gap-3"
                                    >
                                        <BookOpen /> Take Quiz
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

const LinkIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
);

export default LevelOverview;
