import Sidebar from '../components/Sidebar';
import { MessageSquare } from 'lucide-react';

const AICoach = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <MessageSquare className="mx-auto text-blue-600 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">AI Coach</h1>
            <p className="text-gray-600 mb-6">
              The AI Coach is available after you complete a practice session. Complete a session to get personalized guidance and hints!
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Go to Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;

