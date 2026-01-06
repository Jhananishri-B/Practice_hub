import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Plus, Edit, Upload } from 'lucide-react';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', total_levels: 1 });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses/with-levels');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/courses', newCourse);
      setShowAddCourse(false);
      setNewCourse({ title: '', description: '', total_levels: 1 });
      fetchCourses();
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course');
    }
  };

  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);

        // Basic validation
        if (!jsonData.title || !jsonData.total_levels) {
          alert('Invalid JSON format. Required fields: title, total_levels');
          return;
        }

        // Ensure description is at least an empty string if missing
        if (jsonData.description === undefined) jsonData.description = '';

        await api.post('/admin/courses', jsonData);
        alert('Course imported successfully!');
        fetchCourses();
      } catch (error) {
        console.error('Error importing JSON:', error);
        alert('Failed to parse JSON or create course. ' + (error.response?.data?.error || error.message));
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
            <p className="text-gray-600">Manage curriculum, subjects, and question banks</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Save Draft
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Publish Changes
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">All Courses</h2>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleJsonUpload}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Upload size={18} />
                Import JSON
              </button>
              <button
                onClick={() => setShowAddCourse(!showAddCourse)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Add New Course
              </button>
            </div>
          </div>

          {showAddCourse && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">NEW COURSE DETAILS</h3>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="e.g., Introduction to Neural Networks"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Levels
                  </label>
                  <input
                    type="number"
                    value={newCourse.total_levels}
                    onChange={(e) => setNewCourse({ ...newCourse, total_levels: parseInt(e.target.value) })}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                    min="1"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCourse(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{course.title.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
                    <p className="text-sm text-gray-600">
                      {course.total_levels} Levels
                      {course.levels && ` • ${course.levels.reduce((sum, l) => sum + parseInt(l.question_count || 0), 0)} Questions`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated: {course.updated_at ? new Date(course.updated_at).toLocaleString() : course.created_at ? new Date(course.created_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/admin/courses/${course.id}/levels`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Manage Questions
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Edit size={18} />
                  </button>
                </div>
              </div>

              {course.levels && course.levels.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Levels:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {course.levels.map((level) => (
                      <div key={level.id} className="text-sm text-gray-600">
                        Level {level.level_number}: {level.question_count || 0} questions
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;

