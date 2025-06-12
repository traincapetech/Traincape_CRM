import { useState, useRef } from 'react';
import { geminiAPI } from '../../services/geminiService';
import { toast } from 'react-hot-toast';

const GeminiAssistant = ({ isFloating = false }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatMode, setChatMode] = useState(false);
  const fileInputRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Handle form submission for generating content
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    setLoading(true);
    setResponse('');
    
    try {
      let result;
      
      if (chatMode) {
        // Add user message to chat
        const newMessages = [
          ...messages,
          { role: 'user', parts: prompt }
        ];
        setMessages(newMessages);
        
        // Send to Gemini chat API
        result = await geminiAPI.chatWithGemini(newMessages);
        
        // Add model response to chat
        setMessages([
          ...newMessages,
          { role: 'model', parts: result.data.data }
        ]);
      } else if (imageData) {
        // Generate content with image
        result = await geminiAPI.generateContentWithImage(prompt, imageData);
      } else {
        // Generate text content
        result = await geminiAPI.generateContent(prompt);
      }
      
      setResponse(result.data.data);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(error.response?.data?.error || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change for image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = () => {
      // Create image preview
      setImagePreview(reader.result);
      
      // Extract base64 data (remove data:image/jpeg;base64, prefix)
      const base64Data = reader.result.split(',')[1];
      setImageData(base64Data);
    };
    
    reader.readAsDataURL(file);
  };

  // Clear the image
  const clearImage = () => {
    setImageData(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle between chat mode and regular mode
  const toggleChatMode = () => {
    setChatMode(!chatMode);
    // Clear previous messages when toggling mode
    setMessages([]);
    setResponse('');
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setResponse('');
  };

  return (
    <div className={`${isFloating ? '' : 'p-4 bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-xl dark:shadow-black/25'}`}>
      {!isFloating && <h2 className="text-2xl font-bold mb-4">Gemini AI Assistant</h2>}
      
      <div className="mb-4">
        <button
          onClick={toggleChatMode}
          className={`mr-2 px-4 py-2 rounded ${
            chatMode ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-600'
          } ${isFloating ? 'text-sm px-2 py-1' : ''}`}
        >
          Chat Mode
        </button>
        
        <button
          onClick={toggleChatMode}
          className={`px-4 py-2 rounded ${
            !chatMode ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-600'
          } ${isFloating ? 'text-sm px-2 py-1' : ''}`}
          disabled={imageData && !chatMode}
        >
          Single Prompt Mode
        </button>
      </div>
      
      {chatMode && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-500">Start a conversation with Gemini...</p>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index}
                className={`mb-3 p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-100 ml-12' 
                    : 'bg-gray-200 dark:bg-slate-600 mr-12'
                }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {message.role === 'user' ? 'You' : 'Gemini'}
                </p>
                <p>{message.parts}</p>
              </div>
            ))
          )}
          
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-sm text-red-600 hover:underline"
            >
              Clear Chat History
            </button>
          )}
        </div>
      )}
      
      {!chatMode && !imageData && (
        <div className="mb-4">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            Add an image (optional)
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500 dark:text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      )}
      
      {imagePreview && (
        <div className="mb-4 relative">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full max-h-64 object-contain rounded-lg" 
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
            aria-label="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            {chatMode ? 'Your Message' : 'Prompt'}
          </label>
          <textarea
            id="prompt"
            rows="4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={chatMode ? "Type your message here..." : "Enter your prompt for Gemini..."}
            className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-blue-300"
        >
          {loading ? 'Processing...' : chatMode ? 'Send Message' : imageData ? 'Analyze Image & Text' : 'Generate Content'}
        </button>
      </form>
      
      {!chatMode && response && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Gemini Response:</h3>
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
};

export default GeminiAssistant; 