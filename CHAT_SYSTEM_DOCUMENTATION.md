# 💬 CRM Chat System Documentation

## Overview

The CRM Chat System is a real-time messaging solution integrated into the existing CRM application. It provides one-on-one chat functionality with features like typing indicators, read receipts, user status tracking, and message persistence.

## 🏗️ Architecture

### Backend Components

#### 1. **Models**
- **`ChatMessage.js`** - Stores individual chat messages
- **`ChatRoom.js`** - Manages chat rooms between users
- **`User.js`** - Extended with chat status fields

#### 2. **Services**
- **`ChatService.js`** - Core business logic for chat operations

#### 3. **Controllers**
- **`ChatController.js`** - HTTP request handlers for chat endpoints

#### 4. **Routes**
- **`chat.js`** - API routes for chat functionality

#### 5. **Socket.IO Integration**
- Real-time messaging via WebSocket connections
- User status broadcasting
- Typing indicators
- Message delivery confirmations

### Frontend Components

#### 1. **Context**
- **`ChatContext.jsx`** - React context for chat state management

#### 2. **Components**
- **`ChatWindow.jsx`** - Main chat interface component
- **`ChatWindow.css`** - Styling for chat components

## 🚀 Features

### ✅ Implemented Features

1. **Real-time Messaging**
   - Instant message delivery via Socket.IO
   - Message persistence in MongoDB
   - Optimistic UI updates

2. **User Status Tracking**
   - Online/Offline/Away status
   - Last seen timestamps
   - Real-time status updates

3. **Chat Rooms Management**
   - Automatic chat room creation
   - Recent chats list
   - Unread message counts

4. **Typing Indicators**
   - Real-time typing status
   - Auto-timeout after inactivity

5. **Message Features**
   - Read receipts
   - Message timestamps
   - Text message support

6. **User Interface**
   - Floating chat toggle button
   - Responsive design
   - User search functionality
   - Beautiful modern UI

## 📡 API Endpoints

### Authentication Required
All chat endpoints require authentication via Bearer token.

### Message Endpoints

#### Send Message
```http
POST /api/chat/messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "recipientId": "user_id",
  "content": "Hello!",
  "messageType": "text"
}
```

#### Get Chat Messages
```http
GET /api/chat/messages/:recipientId?page=1&limit=50
Authorization: Bearer <token>
```

#### Mark Messages as Read
```http
PUT /api/chat/messages/read/:senderId
Authorization: Bearer <token>
```

### Chat Room Endpoints

#### Get User's Chat Rooms
```http
GET /api/chat/rooms
Authorization: Bearer <token>
```

### User Endpoints

#### Get All Users for Chat
```http
GET /api/chat/users
Authorization: Bearer <token>
```

#### Get Online Users
```http
GET /api/chat/users/online
Authorization: Bearer <token>
```

#### Update Chat Status
```http
PUT /api/chat/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "ONLINE" // ONLINE, OFFLINE, AWAY
}
```

## 🔌 Socket.IO Events

### Client to Server Events

#### Join User Room
```javascript
socket.emit('join-user-room', userId);
```

#### Send Message
```javascript
socket.emit('sendMessage', {
  senderId: 'user_id',
  recipientId: 'recipient_id',
  content: 'Hello!',
  messageType: 'text'
});
```

#### Typing Indicator
```javascript
socket.emit('typing', {
  senderId: 'user_id',
  recipientId: 'recipient_id',
  isTyping: true
});
```

#### Update Status
```javascript
socket.emit('updateStatus', {
  userId: 'user_id',
  status: 'ONLINE'
});
```

### Server to Client Events

#### New Message
```javascript
socket.on('newMessage', (message) => {
  // Handle new message
});
```

#### Message Notification
```javascript
socket.on('messageNotification', (notification) => {
  // Show notification
});
```

#### User Status Update
```javascript
socket.on('userStatusUpdate', (statusUpdate) => {
  // Update user status in UI
});
```

#### Typing Indicator
```javascript
socket.on('userTyping', (typingData) => {
  // Show/hide typing indicator
});
```

#### Message Delivered
```javascript
socket.on('messageDelivered', (confirmation) => {
  // Message delivery confirmation
});
```

## 🗄️ Database Schema

### ChatMessage Collection
```javascript
{
  _id: ObjectId,
  chatId: String, // Unique identifier for chat room
  senderId: ObjectId, // Reference to User
  recipientId: ObjectId, // Reference to User
  content: String,
  messageType: String, // 'text', 'image', 'file'
  isRead: Boolean,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### ChatRoom Collection
```javascript
{
  _id: ObjectId,
  chatId: String, // Unique identifier
  senderId: ObjectId, // Reference to User
  recipientId: ObjectId, // Reference to User
  lastMessage: String,
  lastMessageTime: Date,
  unreadCount: {
    senderId: Number,
    recipientId: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### User Collection (Extended)
```javascript
{
  // ... existing fields ...
  chatStatus: String, // 'ONLINE', 'OFFLINE', 'AWAY'
  lastSeen: Date
}
```

## 🎨 UI Components

### Chat Toggle Button
- Fixed position floating button
- Shows unread message count
- Click to open/close chat

### Chat Window
- Resizable chat interface
- User list sidebar
- Recent chats list
- Active chat area
- Message input with send button

### Message Bubbles
- Sent messages (right-aligned, blue)
- Received messages (left-aligned, white)
- Timestamps and read receipts
- Typing indicators

## 🔧 Installation & Setup

### Backend Dependencies
```bash
# Already included in existing server
npm install socket.io
```

### Frontend Dependencies
```bash
cd client
npm install socket.io-client
```

### Environment Variables
No additional environment variables required. Uses existing CRM configuration.

## 🧪 Testing

### API Testing
Run the included test script:
```bash
node test_chat_api.cjs
```

### Manual Testing
1. Start the server: `npm start` (in server directory)
2. Start the client: `npm start` (in client directory)
3. Login with multiple users
4. Test chat functionality

## 🚀 Usage

### For Users
1. **Starting a Chat**
   - Click the floating chat button
   - Click "+" to start new chat
   - Select a user from the list

2. **Sending Messages**
   - Type in the message input
   - Press Enter or click send button
   - See typing indicators when others are typing

3. **Managing Chats**
   - View recent chats in the sidebar
   - See unread message counts
   - Switch between different conversations

### For Developers

#### Adding New Message Types
1. Update `messageType` enum in `ChatMessage` model
2. Add handling in `ChatService.saveMessage()`
3. Update frontend to handle new message types

#### Extending User Status
1. Add new status to `chatStatus` enum in `User` model
2. Update status handling in `ChatService`
3. Add UI indicators for new status

## 🔒 Security Features

- **Authentication Required**: All endpoints require valid JWT token
- **User Isolation**: Users can only access their own chats
- **Input Validation**: Message content validation and sanitization
- **Rate Limiting**: Socket.IO connection limits (configurable)

## 📱 Mobile Responsiveness

- Responsive design for mobile devices
- Touch-friendly interface
- Optimized for small screens
- Swipe gestures support

## 🎯 Future Enhancements

### Planned Features
- [ ] Group chat functionality
- [ ] File and image sharing
- [ ] Message search
- [ ] Chat history export
- [ ] Push notifications
- [ ] Message encryption
- [ ] Voice messages
- [ ] Video calling integration

### Performance Optimizations
- [ ] Message pagination
- [ ] Connection pooling
- [ ] Redis for session management
- [ ] CDN for file sharing

## 🐛 Troubleshooting

### Common Issues

#### Chat not connecting
- Check if server is running on correct port
- Verify Socket.IO configuration
- Check browser console for errors

#### Messages not sending
- Verify authentication token
- Check network connectivity
- Ensure recipient exists

#### Status not updating
- Check Socket.IO connection
- Verify user permissions
- Check server logs

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.debug = 'socket.io-client:socket';
```

## 📞 Support

For technical support or feature requests, contact the development team.

---

**🎉 The chat system is now fully integrated into your CRM and ready for use!** 