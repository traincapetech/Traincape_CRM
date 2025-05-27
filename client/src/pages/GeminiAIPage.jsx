import GeminiAssistant from '../components/AI/GeminiAssistant';

const GeminiAIPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
        <p className="text-gray-600">
          Get help with customer inquiries, generate content, analyze images, and more using Google's Gemini AI.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <GeminiAssistant />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">How Gemini AI Can Help You</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Customer Support</h3>
              <p className="text-gray-600">
                Draft personalized responses to customer inquiries, create follow-up emails, and generate helpful content.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Content Creation</h3>
              <p className="text-gray-600">
                Generate product descriptions, marketing copy, social media posts, and other content for your business.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Data Analysis</h3>
              <p className="text-gray-600">
                Ask questions about your business data and get AI-powered insights and recommendations.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Image Analysis</h3>
              <p className="text-gray-600">
                Upload images for analysis, description, or to extract information contained in visuals.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Conversation Mode</h3>
              <p className="text-gray-600">
                Have a multi-turn conversation with the AI to refine ideas or explore complex topics in depth.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800">Pro Tips</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-2 mt-2">
              <li>Be specific in your prompts for better results</li>
              <li>For image analysis, use clear, high-quality images</li>
              <li>In chat mode, you can reference previous messages</li>
              <li>Try different ways of asking to get varied responses</li>
              <li>Save useful responses for future reference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiAIPage; 