import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { MessageSquare, Send, Sparkles, Loader2, Lightbulb } from 'lucide-react';

const quickTopics = [
  'Explain time complexity of my code',
  'Help me understand this error message',
  'How can I optimize my solution?',
  'Explain loops and conditionals in simple terms',
  'What is the difference between list and array?',
];

const AICoach = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        role: 'assistant',
        content:
          'Hi! I am your AI Coach. Ask me anything about your practice questions, code, errors, or programming concepts. I will do my best to guide you step-by-step.',
      },
    ]);
  }, []);

  const sendMessage = async (text, topicOverride) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = trimmed;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/ai-tutor/free-chat', {
        message: userMessage,
        topic: topicOverride || 'AI Coach question',
        questionType: 'coding',
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.message,
        },
      ]);
    } catch (error) {
      console.error('AI Coach error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I had trouble answering that. Please try rephrasing your question or ask about a specific piece of code or concept.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickTopic = (topic) => {
    setInput(topic);
    // Optionally send immediately:
    // sendMessage(topic, topic);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col">
        <div className="max-w-5xl mx-auto flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="text-blue-600" size={28} />
                AI Coach
              </h1>
              <p className="text-gray-600 mt-1">
                Ask doubts about your code, errors, or concepts. I will respond with clear,
                step-by-step explanations.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
              <Sparkles size={18} />
              <span>Powered by your practice context</span>
            </div>
          </div>

          {/* Main layout */}
          <div className="flex flex-col lg:flex-row gap-6 flex-1">
            {/* Chat panel */}
            <div className="flex-1 bg-white rounded-xl shadow-md flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium text-gray-700">AI Coach is online</span>
                </div>
                <span className="text-xs text-gray-400">Ask follow-up questions any time</span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a doubt about your code, an error message, or a concept..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium gap-1"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                    <span>Send</span>
                  </button>
                </form>
                <p className="mt-2 text-xs text-gray-500">
                  AI can make mistakes. Use responses as guidance and always verify code before
                  using it.
                </p>
              </div>
            </div>

            {/* Helper / quick prompts panel */}
            <div className="w-full lg:w-72 space-y-4">
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="text-yellow-500" size={18} />
                  <h2 className="text-sm font-semibold text-gray-800">Try asking about</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickTopics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleQuickTopic(topic)}
                      className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Best results tips</p>
                <ul className="list-disc list-inside space-y-1 text-blue-900/90">
                  <li>Mention the language you are using (e.g., C, Python).</li>
                  <li>Paste the exact error message or snippet of code if possible.</li>
                  <li>Ask one focused question at a time for clearer explanations.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;

