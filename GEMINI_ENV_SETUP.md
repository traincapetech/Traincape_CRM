# Gemini API Setup Guide

To complete the Gemini AI integration with your CRM, follow these steps:

## 1. Set Environment Variable for the Server

Add the Gemini API key to your server's `.env` file:

```
GEMINI_API_KEY=AIzaSyBk5ifdCZJDlE-iqE87i-FcZ2pcKcj8UMw
```

## 2. Restart the Server

After adding the environment variable, restart your server:

```bash
cd server
npm run dev
```

## 3. Using the AI Assistant

The AI Assistant is now accessible in two ways:

### Floating Button
A floating AI Assistant button appears on every page of the application. Click it to open the assistant in a popup modal.

### Dedicated Page
You can also access the full AI Assistant page at: `/ai-assistant`

## Features

- **Text Generation**: Get AI-generated content based on your prompts
- **Image Analysis**: Upload images for AI to analyze
- **Chat Mode**: Have multi-turn conversations with the AI
- **Available Everywhere**: Access the assistant from any page in the CRM

## Security Note

The Gemini API key is stored server-side only and is not exposed to clients. All API calls are proxied through your server for security. 