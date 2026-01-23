import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { BookOpen, Code, Lightbulb, ExternalLink, ArrowRight, Sparkles, Loader, Edit, Save, Plus, X, Trash2, CheckCircle, FolderIcon } from 'lucide-react';

const getYouTubeEmbedUrl = (input) => {
    if (!input) return '';

    // 1. Check for standard Playlist URL
    if (input.includes('list=')) {
        const listId = input.split('list=')[1]?.split('&')[0];
        if (listId) return `https://www.youtube.com/embed?listType=playlist&list=${listId}`;
    }

    // 2. Parse all Video IDs from input (multiline support)
    const videoIds = [];
    const lines = input.split(/[\n,;]+/); // Split by newline, comma, or semicolon

    lines.forEach(line => {
        let id = '';
        if (line.includes('youtu.be/')) {
            id = line.split('youtu.be/')[1]?.split('?')[0];
        } else if (line.includes('v=')) {
            id = line.split('v=')[1]?.split('&')[0];
        } else if (line.includes('youtube.com/embed/')) {
            id = line.split('embed/')[1]?.split('?')[0];
        } else if (line.trim().length === 11) {
            // Potential raw video ID (YouTube IDs are 11 chars)
            id = line.trim();
        }

        if (id && id.length === 11) {
            videoIds.push(id);
        }
    });

    if (videoIds.length === 0) return input; // Return raw if no logic matched

    // 3. Construct Embed URL
    if (videoIds.length === 1) {
        return `https://www.youtube.com/embed/${videoIds[0]}`;
    } else {
        // Multiple videos: First one is main, rest are playlist
        const [first, ...rest] = videoIds;
        return `https://www.youtube.com/embed/${first}?playlist=${rest.join(',')}`;
    }
};

const LevelOverview = () => {
    const { courseId, levelId } = useParams();
    const navigate = useNavigate();
    const [lessonPlan, setLessonPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [editData, setEditData] = useState({
        introduction: '',
        concepts: [],
        resources: [],
        key_terms: [],
        example_code: '',
        youtube_url: ''
    });

    useEffect(() => {
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
                example_code: response.data.example_code || '',
                youtube_url: response.data.youtube_url || ''
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
                    key_terms: editData.key_terms,
                    youtube_url: editData.youtube_url
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Video URL</label>
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px] font-mono text-sm"
                                        placeholder="Paste one or more YouTube URLs here (one per line)..."
                                        value={editData.youtube_url}
                                        onChange={(e) => setEditData({ ...editData, youtube_url: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500">
                                        💡 Tip: Paste multiple video URLs (one per line) to create a playlist automatically. Or paste a single standard Playlist URL.
                                    </p>
                                    {editData.youtube_url && (
                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-xs font-medium text-green-700 mb-2">✅ Preview:</p>
                                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={getYouTubeEmbedUrl(editData.youtube_url)}
                                                    title="Video Preview"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        </div>
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
                    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
                        {/* Header Section */}
                        <div className="space-y-6">
                            <div className={`grid grid-cols-1 ${lessonPlan.youtube_url?.trim() ? 'lg:grid-cols-3' : ''} gap-8`}>
                                {/* Left Column - Title and Info */}
                                <div className={`space-y-6 ${lessonPlan.youtube_url?.trim() ? 'lg:col-span-2' : ''}`}>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                                                <BookOpen size={20} strokeWidth={2.5} />
                                            </div>
                                            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                                LEVEL {lessonPlan.level_number ?? levelId}
                                            </span>
                                        </div>

                                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                            {lessonPlan.title || `Level ${levelId} Overview`}
                                        </h1>
                                    </div>

                                    <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                                        {lessonPlan.introduction}
                                    </p>

                                    {/* Key Terms */}
                                    {lessonPlan.key_terms && lessonPlan.key_terms.length > 0 && (
                                        <div className="pt-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                                KEY TERMS
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {lessonPlan.key_terms.map((term, idx) => (
                                                    <span key={idx} className="px-4 py-2 bg-white border border-gray-200 text-blue-700 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-default">
                                                        {term}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - YouTube Video */}
                                {lessonPlan.youtube_url && lessonPlan.youtube_url.trim() && (
                                    <div className="lg:col-span-1">
                                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200 overflow-hidden border border-gray-100 relative group transform hover:-translate-y-1 transition-transform duration-300">
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 z-10"></div>
                                            <div className="p-4 bg-white border-b border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-bold text-gray-800 text-sm">Video Tutorial</span>
                                                </div>
                                                <ExternalLink size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                                            </div>
                                            <div className="aspect-video bg-black relative">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={getYouTubeEmbedUrl(lessonPlan.youtube_url)}
                                                    title="Course Video Tutorial"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Core Topics Grid */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1 h-6 bg-gray-200 rounded-full"></div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    CORE TOPICS
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lessonPlan.concepts.map((concept, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full group">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                            {/* Dynamic Icon based on index */}
                                            {[<Code size={24} />, <Lightbulb size={24} />, <Sparkles size={24} />, <BookOpen size={24} />][idx % 4]}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-blue-600 transition-colors">
                                            {concept.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed flex-1">
                                            {concept.explanation}
                                        </p>
                                    </div>
                                ))}
                                {lessonPlan.concepts.length === 0 && (
                                    <div className="col-span-3 text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                            <BookOpen size={20} />
                                        </div>
                                        <p className="text-gray-500 font-medium">No core topics defined yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Example Code Section */}
                        {lessonPlan.example_code && (
                            <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#0F172A] border border-gray-800">
                                <div className="flex items-center justify-between px-6 py-4 bg-[#1E293B] border-b border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                        </div>
                                        <span className="text-xs font-mono text-gray-400 ml-2">EXAMPLE CODE</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Code size={14} />
                                        <span>read-only</span>
                                    </div>
                                </div>
                                <div className="relative group p-1">
                                    <pre className="font-mono text-sm text-blue-100 overflow-x-auto p-6 leading-relaxed">
                                        {lessonPlan.example_code}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Lower Section: Materials & Assessment */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Left Col: Course Materials (Size: 4/12) */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FolderIcon className="text-gray-400" size={20} />
                                        <h3 className="font-bold text-gray-900 text-lg">Course Materials</h3>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
                                        {lessonPlan.resources.length} ASSETS
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {lessonPlan.resources.map((res, idx) => (
                                        <a
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:translate-x-1 transition-all flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shadow-sm">
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-blue-700 transition-colors">
                                                    {res.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                    <span>External Resource</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span className="group-hover:text-blue-500 transition-colors">Click to view</span>
                                                </p>
                                            </div>
                                            <ExternalLink size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                                        </a>
                                    ))}
                                    {lessonPlan.resources.length === 0 && (
                                        <div className="text-sm text-gray-500 italic p-6 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                            No materials added for this level.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Col: Assessment (Size: 8/12) */}
                            <div className="lg:col-span-7">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden flex flex-col justify-between h-full min-h-[400px] hover:shadow-3xl transition-shadow duration-500 group">
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out">
                                        <Sparkles size={300} />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none -mr-16 -mb-16 animate-pulse"></div>

                                    {/* Content */}
                                    <div className="relative z-10 space-y-8">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold tracking-wider uppercase text-blue-50">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                            Assessment Ready
                                        </span>

                                        <div>
                                            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                                                Ready to Test <br /> Your Knowledge?
                                            </h2>
                                            <p className="text-blue-100 text-lg leading-relaxed max-w-lg font-medium">
                                                Validation is the final step of learning. Prove your proficiency
                                                in <strong className="text-white border-b-2 border-white/30">Level {lessonPlan.level_number ?? levelId}</strong> fundamentals and earn your certification badge.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto pt-10 relative z-10">
                                        <button
                                            onClick={() => navigate(`/mcq-practice/${courseId}/${levelId}`, { state: { sessionType: 'mcq' } })}
                                            className="bg-white text-blue-900 px-6 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-4 group/btn"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                                <CheckCircle size={22} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-0.5">Quiz</div>
                                                <div className="text-lg">Take MCQ Test</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/practice/${courseId}/${levelId}`, { state: { sessionType: 'coding' } })}
                                            className="bg-blue-500/30 backdrop-blur-md border border-white/20 text-white px-6 py-5 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-4 hover:-translate-y-1"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                <Code size={22} />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-0.5">Practice</div>
                                                <div className="text-lg">Start Coding</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </Layout >
    );
};

const LinkIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
);

export default LevelOverview;