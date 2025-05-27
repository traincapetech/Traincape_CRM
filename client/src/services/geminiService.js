import api from './api';

// Gemini API service wrapper
export const geminiAPI = {
  // Generate text content using Gemini
  generateContent: (prompt, options = {}) => {
    console.log('Calling geminiAPI.generateContent() with prompt:', prompt);
    return api.post('/api/gemini/generate', { prompt, options });
  },

  // Generate content with image using Gemini
  generateContentWithImage: (prompt, imageData) => {
    console.log('Calling geminiAPI.generateContentWithImage()');
    return api.post('/api/gemini/generate-with-image', { prompt, imageData });
  },

  // Chat with Gemini
  chatWithGemini: (messages) => {
    console.log('Calling geminiAPI.chatWithGemini() with messages:', messages.length);
    return api.post('/api/gemini/chat', { messages });
  }
};

export default geminiAPI; 