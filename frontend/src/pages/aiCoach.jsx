import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Send, Bot, User, Sparkles, Loader } from 'lucide-react';

const AICoach = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your sophisticated AI Tutor. I can help you with coding questions, concepts, and debugging. specific problem are you working on?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const STARTER_PROMPTS = [
        "Explain Big O notation",
        "How do loops work in Python?",
        "Debug a segmentation fault",
        "What is a Promise in JS?"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleClearChat = () => {
        if (window.confirm("Start a new conversation?")) {
            setMessages([
                { role: 'assistant', content: "Hello! I'm your sophisticated AI Tutor. I can help you with coding questions, concepts, and debugging. What are you working on?" }
            ]);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const setUserInputAndSend = (text) => {
        setInput(text);
        // We can't immediately trigger submit because state update is async, 
        // but for better UX we could auto-submit.
        // For now, let's just populate the input.
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const textToSend = input.trim();
        if (!textToSend) return;

        const userMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/ai-tutor/chat', {
                message: textToSend,
            });

            const aiMessage = { role: 'assistant', content: response.data.reply || response.data.message || "I understood that." };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errorMessage = { role: 'assistant', content: "I'm having trouble connecting to my brain right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6 shadow-sm flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-purple-200">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">PracticeHub AI Coach</h1>
                            <p className="text-gray-500 text-sm">Your personal intelligent coding assistant</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClearChat}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Clear Chat"
                    >
                        <Bot size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                    {messages.length === 1 && (
                        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                            {STARTER_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setUserInputAndSend(prompt)}
                                    className="p-4 bg-white border border-purple-100 rounded-xl hover:border-purple-300 hover:shadow-md transition-all text-left text-gray-700 text-sm font-medium"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {msg.role === 'assistant' && (
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                    <Bot size={20} className="text-purple-600" />
                                </div>
                            )}

                            <div className={`max-w-[80%] rounded-2xl p-5 shadow-sm ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                                : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                                }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm mt-1 border border-blue-200">
                                    <User size={20} className="text-blue-600" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4 justify-start animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                                <Bot size={20} className="text-purple-600" />
                            </div>
                            <div className="bg-white border border-gray-100 p-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about code..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all shadow-inner text-gray-700 placeholder-gray-400"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <p className="text-xs text-gray-400">AI can make mistakes. Consider checking important information.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AICoach;
