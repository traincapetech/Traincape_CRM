#!/bin/bash

# Add Gemini API key to .env file if it doesn't exist
if [ ! -f server/.env ]; then
  echo "Creating .env file for server..."
  echo "GEMINI_API_KEY=AIzaSyBk5ifdCZJDlE-iqE87i-FcZ2pcKcj8UMw" > server/.env
else
  if ! grep -q "GEMINI_API_KEY" server/.env; then
    echo "Adding Gemini API key to .env file..."
    echo "GEMINI_API_KEY=AIzaSyBk5ifdCZJDlE-iqE87i-FcZ2pcKcj8UMw" >> server/.env
  fi
fi

# Start the server in the background
echo "Starting server..."
cd server && npm run dev &
SERVER_PID=$!

# Wait a moment for the server to start
sleep 5

# Start the client
echo "Starting client..."
cd client && npm run dev

# When the client is stopped, also stop the server
kill $SERVER_PID 