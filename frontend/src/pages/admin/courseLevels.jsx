import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Plus, Edit, Trash2, Clock, Upload, ArrowLeft, Loader } from 'lucide-react';

const AdminCourseLevels = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('coding'); // 'coding' | 'mcq'

  // Modals
  const [timeLimitModal, setTimeLimitModal] = useState({ show: false, levelId: null, timeLimit: null });
  const [csvUploadModal, setCsvUploadModal] = useState({ show: false, levelId: null, uploading: false, questionType: null });


  const handleCsvFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvUploadModal(prev => ({ ...prev, uploading: true }));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level_id', csvUploadModal.levelId);
    if (csvUploadModal.questionType) formData.append('question_type', csvUploadModal.questionType);

    try {
      const res = await api.post('/admin/questions/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Uploaded ${res.data.count} questions! Errors: ${res.data.errors?.length || 0}`);
      setCsvUploadModal({ show: false, levelId: null, uploading: false, questionType: null });
      fetchData();
    } catch (err) {
      alert('Upload failed');
      setCsvUploadModal(prev => ({ ...prev, uploading: false }));
    }
  };


  if (loading) return <div className="flex min-h-screen items-center justify-center text-blue-600">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate('/admin/courses')} className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-2">
              <ArrowLeft size={18} className="mr-1" /> Back
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{course?.title}</h1>
            <p className="text-gray-500 mt-1">{course?.levels?.length || 0} Levels • Last updated {new Date().toLocaleDateString()}</p>
          </div>
          <button
            onClick={handleAddLevel}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-medium"
          >
            <Plus size={20} /> Add New Level
          </button>
        </div>

        {/* Levels Grid */}
        <div className="space-y-8">
          {levels.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">No Levels Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2 mb-6">Start building your course structure by adding the first level.</p>
              <button onClick={handleAddLevel} className="text-blue-600 font-semibold hover:underline">Create First Level</button>
            </div>
          )}

          {levels.map((level, idx) => (
            <div key={level.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">

              {/* Level Header */}
              <div className="p-6 border-b border-gray-50 flex items-start justify-between bg-gradient-to-r from-white to-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border border-blue-200">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{level.title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{level.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/courses/${courseId}/level/${level.id}/learn`)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100 font-medium text-sm"
                  >
                    <Edit size={16} /> Edit Overview
                  </button>
                  <button
                    onClick={() => setCsvUploadModal({ show: true, levelId: level.id, uploading: false, questionType: null })}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100 font-medium text-sm"
                  >
                    <Upload size={16} /> Import CSV
                  </button>
                  <button
                    onClick={() => navigate(`/admin/questions/create?levelId=${level.id}&courseId=${courseId}`)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Add Manual Question"
                  >
                    <Plus size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Questions Body */}
              <div className="p-6 bg-gray-50/30">
                <div className="flex items-center gap-6 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('coding')}
                    className={`pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'coding' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Coding Questions
                    {activeTab === 'coding' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>}
                  </button>
                  <button
                    onClick={() => setActiveTab('mcq')}
                    className={`pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'mcq' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Multiple Choice
                    {activeTab === 'mcq' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>}
                  </button>
                </div>

                <div className="space-y-3">
                  {questions[level.id]?.filter(q => q.question_type === activeTab).length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                      No {activeTab.toUpperCase()} questions in this level yet.
                    </div>
                  ) : (
                    questions[level.id]?.filter(q => q.question_type === activeTab).map(q => (
                      <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors group">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${q.difficulty === 'hard' ? 'bg-red-100 text-red-600' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-gray-800 font-medium group-hover:text-blue-700 transition-colors">{q.title}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/admin/questions/edit/${q.id}?type=${q.question_type}`)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>



        {/* CSV UPLOAD MODAL */}
        {csvUploadModal.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Upload className="text-green-600" /> Upload CSV
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {!csvUploadModal.questionType ? (
                  <div className="flex gap-4">
                    <button onClick={() => setCsvUploadModal({ ...csvUploadModal, questionType: 'coding' })} className="flex-1 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 text-gray-600 hover:text-blue-600">
                      <span className="font-bold">Coding</span>
                    </button>
                    <button onClick={() => setCsvUploadModal({ ...csvUploadModal, questionType: 'mcq' })} className="flex-1 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center gap-2 text-gray-600 hover:text-green-600">
                      <span className="font-bold">MCQ</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">Upload <b>{csvUploadModal.questionType}</b> questions CSV.</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileSelect}
                      disabled={csvUploadModal.uploading}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {csvUploadModal.uploading && <div className="mt-4 text-center text-blue-600 text-sm font-medium animate-pulse">Uploading and processing...</div>}
                  </div>
                )}
                <button onClick={() => setCsvUploadModal({ show: false, levelId: null, uploading: false, questionType: null })} className="w-full py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCourseLevels;
