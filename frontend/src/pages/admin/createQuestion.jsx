import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Editor from '@monaco-editor/react';
import api from '../../services/api';
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react';

const CreateQuestion = () => {
  const [searchParams] = useSearchParams();
  const { questionId } = useParams();
  const levelId = searchParams.get('levelId') || searchParams.get('level_id');
  const courseId = searchParams.get('courseId') || searchParams.get('course_id');
  const questionTypeParam = searchParams.get('type');
  const navigate = useNavigate();
  
  const isEditMode = !!questionId;
  const [questionType, setQuestionType] = useState(questionTypeParam || 'coding');
  const [course, setCourse] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    input_format: '',
    output_format: '',
    constraints: '',
    reference_solution: '',
    difficulty: 'medium',
    test_cases: [{ input_data: '', expected_output: '', is_hidden: false }],
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ],
    // For MCQ: correct answer as full text (should match one of the option texts)
    correct_answer: '',
  });

  useEffect(() => {
    // Get course info to determine language
    if (courseId) {
      api.get('/admin/courses/with-levels')
        .then((response) => {
          const courseData = response.data.find((c) => c.id === courseId);
          setCourse(courseData);
        })
        .catch((error) => console.error('Failed to fetch course:', error));
    }

    // Load question data if editing
    if (isEditMode && questionId) {
      api.get(`/admin/questions/${questionId}`)
        .then((response) => {
          const question = response.data;
          setQuestionType(question.question_type);
          setFormData({
            title: question.title || '',
            description: question.description || '',
            input_format: question.input_format || '',
            output_format: question.output_format || '',
            constraints: question.constraints || '',
            reference_solution: question.reference_solution || '',
            difficulty: question.difficulty || 'medium',
            test_cases: question.test_cases && question.test_cases.length > 0
              ? question.test_cases.map((tc) => ({
                  input_data: tc.input_data || '',
                  expected_output: tc.expected_output || '',
                  is_hidden: tc.is_hidden || false,
                }))
              : [{ input_data: '', expected_output: '', is_hidden: false }],
            options:
              question.options && question.options.length > 0
                ? question.options.map((opt) => ({
                    option_text: opt.option_text || '',
                    is_correct: opt.is_correct || false,
                  }))
                : [
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                  ],
            // Pre-fill correct_answer with the text of the correct option (if any)
            // Handle both boolean true and numeric 1 (MySQL returns 1 for true)
            correct_answer:
              question.options && question.options.length > 0
                ? (() => {
                    // Check for correct option - handle MySQL boolean (0/1) and JavaScript boolean
                    // Also handle Buffer type that MySQL2 might return
                    const correctOpt = question.options.find((opt) => {
                      const isCorrect = opt.is_correct;
                      // Handle various formats: true, 1, '1', 'true', Buffer(1)
                      if (isCorrect === true) return true;
                      if (isCorrect === 1 || isCorrect === '1') return true;
                      if (isCorrect === 'true') return true;
                      if (Buffer.isBuffer(isCorrect) && isCorrect[0] === 1) return true;
                      return false;
                    });
                    return correctOpt?.option_text || '';
                  })()
                : '',
          });
        })
        .catch((error) => {
          console.error('Failed to load question:', error);
          alert('Failed to load question');
        });
    }
  }, [questionId, isEditMode, courseId]);

  const getEditorLanguage = () => {
    if (!course) return 'python';
    const courseTitle = course.title?.toLowerCase() || '';
    if (courseTitle.includes('c programming') || courseTitle.includes('c ')) {
      return 'c';
    }
    return 'python';
  };

  const getLanguageLabel = () => {
    const lang = getEditorLanguage();
    return lang === 'c' ? 'C' : 'Python 3';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.title.trim()) {
      alert('Please enter a question title');
      return;
    }

    if (!formData.description || !formData.description.trim()) {
      alert('Please enter a question description');
      return;
    }

    try {
      if (questionType === 'mcq') {
        // Basic validation for MCQ: ensure correct answer matches one of the options
        if (!formData.correct_answer || !formData.correct_answer.trim()) {
          alert('Please enter the correct answer text that matches one of the options');
          return;
        }

        const trimmedCorrect = formData.correct_answer.trim().toLowerCase();
        const optionsWithText = formData.options.map((opt) => ({
          ...opt,
          option_text: (opt.option_text || '').trim(),
        }));

        // Check if all options have text
        const emptyOptions = optionsWithText.filter((opt) => !opt.option_text);
        if (emptyOptions.length > 0) {
          alert('Please fill in all option fields');
          return;
        }

        const matchingOptionIndex = optionsWithText.findIndex(
          (opt) => opt.option_text.toLowerCase() === trimmedCorrect
        );

        if (matchingOptionIndex === -1) {
          alert(
            'The Correct Answer must exactly match one of the option texts (case-insensitive).\n\n' +
            'Current options:\n' +
            optionsWithText.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt.option_text}`).join('\n')
          );
          return;
        }

        // Mark only the matching option as correct
        const optionsWithCorrect = optionsWithText.map((opt, index) => ({
          ...opt,
          is_correct: index === matchingOptionIndex,
        }));

        if (isEditMode) {
          await api.put(`/admin/questions/mcq/${questionId}`, {
            title: formData.title.trim(),
            description: formData.description.trim(),
            options: optionsWithCorrect,
            difficulty: formData.difficulty,
          });
        } else {
          await api.post('/admin/questions/mcq', {
            level_id: levelId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            options: optionsWithCorrect,
            difficulty: formData.difficulty,
          });
        }
      } else {
        // Coding question validation
        if (!formData.reference_solution || !formData.reference_solution.trim()) {
          alert('Please enter a reference solution');
          return;
        }

        if (!formData.test_cases || formData.test_cases.length === 0) {
          alert('Please add at least one test case');
          return;
        }

        // Coding question (unchanged)
        if (isEditMode) {
          await api.put(`/admin/questions/coding/${questionId}`, formData);
        } else {
          await api.post('/admin/questions/coding', {
            level_id: levelId,
            ...formData,
          });
        }
      }

      // Show success popup
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/admin/courses/${courseId}/levels`);
      }, 2000);
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question');
    }
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      test_cases: [...formData.test_cases, { input_data: '', expected_output: '', is_hidden: false }],
    });
  };

  const removeTestCase = (index) => {
    setFormData({
      ...formData,
      test_cases: formData.test_cases.filter((_, i) => i !== index),
    });
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...formData.test_cases];
    newTestCases[index][field] = value;
    setFormData({ ...formData, test_cases: newTestCases });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <nav className="text-sm text-gray-600 mb-4">
            Home / Questions / {isEditMode ? 'Edit' : 'Create New'}
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditMode ? 'Edit Question' : 'Create New Question'}
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/admin/courses/${courseId}/levels`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={18} />
                Save Question
              </button>
            </div>
          </div>
        </div>

        {/* Success Popup */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md text-center">
              <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Question Saved Successfully!</h3>
              <p className="text-gray-600">The question has been {isEditMode ? 'updated' : 'created'} successfully.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Question Type</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setQuestionType('coding')}
              className={`px-6 py-3 rounded-lg font-medium ${
                questionType === 'coding'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Coding Question
            </button>
            <button
              onClick={() => setQuestionType('mcq')}
              className={`px-6 py-3 rounded-lg font-medium ${
                questionType === 'mcq'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              MCQ Question
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Binary Search Implementation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter the problem description, constraints, and examples..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={6}
              required
            />
          </div>

          {questionType === 'coding' && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Input Format
                  </label>
                  <textarea
                    value={formData.input_format}
                    onChange={(e) => setFormData({ ...formData, input_format: e.target.value })}
                    placeholder="Describe the expected input structure..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                  />
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <textarea
                    value={formData.output_format}
                    onChange={(e) => setFormData({ ...formData, output_format: e.target.value })}
                    placeholder="Describe the expected output structure..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Solution ({getLanguageLabel()})
                </label>
                <Editor
                  height="300px"
                  language={getEditorLanguage()}
                  value={formData.reference_solution}
                  onChange={(value) => setFormData({ ...formData, reference_solution: value || '' })}
                  theme="vs-light"
                />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Test Cases</h3>
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Add Test Case
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.test_cases.map((testCase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Test Case {index + 1}</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={testCase.is_hidden}
                              onChange={(e) =>
                                updateTestCase(index, 'is_hidden', e.target.checked)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-600">Hidden</span>
                          </label>
                          {formData.test_cases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTestCase(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Input
                          </label>
                          <textarea
                            value={testCase.input_data}
                            onChange={(e) =>
                              updateTestCase(index, 'input_data', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={3}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Output
                          </label>
                          <textarea
                            value={testCase.expected_output}
                            onChange={(e) =>
                              updateTestCase(index, 'expected_output', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={3}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {questionType === 'mcq' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Answer Options</h3>
              <div className="space-y-3 mb-6">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                    <input
                      type="text"
                      value={option.option_text}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index].option_text = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder="Enter option text..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer (Text) *
                </label>
                <input
                  type="text"
                  value={formData.correct_answer}
                  onChange={(e) => {
                    setFormData({ ...formData, correct_answer: e.target.value });
                  }}
                  placeholder="Enter the correct answer text (must match one of the options)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  This should exactly match the text of the correct option (for example: "
                  <span className="italic">0</span>" or "
                  <span className="italic">Depends on language</span>").
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestion;
