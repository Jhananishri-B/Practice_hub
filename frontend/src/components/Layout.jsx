import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 transition-all duration-300 flex flex-col relative min-w-0">
                <div className="w-full flex justify-end px-4 py-2 z-40">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-medium text-sm">Back</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full relative overflow-x-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
