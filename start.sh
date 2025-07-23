#!/bin/bash

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