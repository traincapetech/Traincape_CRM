import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GeminiAssistant from './GeminiAssistant';

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  const openFullPage = () => {
    navigate('/ai-assistant');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleAssistant}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg dark:shadow-black/25 z-50 flex items-center justify-center transition-all duration-300 transform hover:scale-105"
        aria-label="AI Assistant"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6"
        >
          <path d="M18.53 9.29a1 1 0 00-1.06 0L12 12.34 6.53 9.29a1 1 0 00-1.06 0 1 1 0 00-.47.82v5.78a1 1 0 00.47.82 1 1 0 00.53.15 1 1 0 00.53-.15L12 13.66l5.47 3.05a1 1 0 00.53.15 1 1 0 00.53-.15 1 1 0 00.47-.82v-5.78a1 1 0 00-.47-.82z" />
          <path d="M18.53 5.11a1 1 0 00-1.06 0L12 8.16 6.53 5.11a1 1 0 00-1.06 0 1 1 0 00-.47.82v1.55a1 1 0 00.47.82 1 1 0 00.53.15 1 1 0 00.53-.15L12 5.26l5.47 3.04a1 1 0 00.53.15 1 1 0 00.53-.15 1 1 0 00.47-.82V5.93a1 1 0 00-.47-.82z" />
        </svg>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Gemini AI Assistant</h2>
              <div className="flex space-x-2">
                <button
                  onClick={openFullPage}
                  className="p-2 text-gray-600 dark:text-white hover:text-gray-900"
                  title="Open in full page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                <button
                  onClick={toggleAssistant}
                  className="p-2 text-gray-600 dark:text-white hover:text-gray-900"
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <GeminiAssistant isFloating={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIButton; 