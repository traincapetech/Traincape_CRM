import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import './ChatWindow.css';

const ChatWindow = () => {
  const { user } = useAuth();
  const {
    isConnected,
    onlineUsers,
    chatRooms,
    activeChat,
    messages,
    unreadCounts,
    typingUsers,
    isChatOpen,
    sendMessage,
    sendTypingIndicator,
    fetchChatRooms,
    fetchAllUsers,
    startChat,
    closeChat,
    setIsChatOpen
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  // Fetch initial data
  useEffect(() => {
    if (isConnected) {
      fetchChatRooms();
      fetchAllUsers();
    }
  }, [isConnected]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && activeChat) {
      sendMessage(activeChat.otherUser._id, messageInput.trim());
      setMessageInput('');
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator
    if (activeChat) {
      sendTypingIndicator(activeChat.otherUser._id, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(activeChat.otherUser._id, false);
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastSeen = (lastSeen) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return lastSeenDate.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE': return '#10b981';
      case 'AWAY': return '#f59e0b';
      case 'OFFLINE': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const filteredUsers = onlineUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = activeChat ? messages[activeChat.chatId] || [] : [];

  if (!isChatOpen) {
    return (
      <div className="chat-toggle-button" onClick={() => setIsChatOpen(true)}>
        <i className="fas fa-comments"></i>
        {Object.values(unreadCounts).reduce((sum, count) => sum + count, 0) > 0 && (
          <span className="unread-badge">
            {Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-left">
          <h3>
            <i className="fas fa-comments"></i>
            Chat
          </h3>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Connected' : 'Connecting...'}
            {!isConnected && (
              <button 
                className="retry-connection"
                onClick={() => window.location.reload()}
                title="Retry connection"
              >
                🔄
              </button>
            )}
          </div>
        </div>
        <div className="chat-header-actions">
          <button 
            className="btn-icon"
            onClick={() => setShowUserList(!showUserList)}
            title="Start new chat"
          >
            <i className="fas fa-plus"></i>
          </button>
          <button 
            className="btn-icon"
            onClick={() => setIsChatOpen(false)}
            title="Minimize chat"
          >
            <i className="fas fa-minus"></i>
          </button>
        </div>
      </div>

      <div className="chat-body">
        {/* User List Sidebar */}
        {showUserList && (
          <div className="user-list-sidebar">
            <div className="user-list-header">
              <h4>Start New Chat</h4>
              <button 
                className="btn-close"
                onClick={() => setShowUserList(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="user-search">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="user-list">
              {filteredUsers.map(u => (
                <div 
                  key={u._id}
                  className="user-item"
                  onClick={() => {
                    startChat(u);
                    setShowUserList(false);
                  }}
                >
                  <div className="user-avatar">
                    {u.profilePicture ? (
                      <img src={u.profilePicture} alt={u.fullName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(u.chatStatus) }}
                    ></span>
                  </div>
                  <div className="user-info">
                    <div className="user-name">{u.fullName}</div>
                    <div className="user-role">{u.role}</div>
                    <div className="user-status">
                      {u.chatStatus === 'ONLINE' ? 'Online' : formatLastSeen(u.lastSeen)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Rooms List */}
        <div className="chat-rooms-list">
          <h4>Recent Chats</h4>
          {chatRooms.length === 0 ? (
            <div className="no-chats">
              <p>No recent chats</p>
              <button 
                className="btn-primary"
                onClick={() => setShowUserList(true)}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            chatRooms.map(room => (
              <div 
                key={room.chatId}
                className={`chat-room-item ${activeChat?.chatId === room.chatId ? 'active' : ''}`}
                onClick={() => startChat(room.otherUser)}
              >
                <div className="user-avatar">
                  {room.otherUser.profilePicture ? (
                    <img src={room.otherUser.profilePicture} alt={room.otherUser.fullName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {room.otherUser.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span 
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(room.otherUser.chatStatus) }}
                  ></span>
                </div>
                <div className="room-info">
                  <div className="room-header">
                    <span className="room-name">{room.otherUser.fullName}</span>
                    <span className="room-time">
                      {formatTime(room.lastMessageTime)}
                    </span>
                  </div>
                  <div className="room-last-message">
                    {room.lastMessage || 'No messages yet'}
                  </div>
                </div>
                {unreadCounts[room.otherUser._id] > 0 && (
                  <span className="unread-count">
                    {unreadCounts[room.otherUser._id]}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Active Chat */}
        {activeChat && (
          <div className="active-chat">
            <div className="chat-header-active">
              <div className="chat-user-info">
                <div className="user-avatar">
                  {activeChat.otherUser.profilePicture ? (
                    <img src={activeChat.otherUser.profilePicture} alt={activeChat.otherUser.fullName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {activeChat.otherUser.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span 
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(activeChat.otherUser.chatStatus) }}
                  ></span>
                </div>
                <div>
                  <div className="chat-user-name">{activeChat.otherUser.fullName}</div>
                  <div className="chat-user-status">
                    {activeChat.otherUser.chatStatus === 'ONLINE' 
                      ? 'Online' 
                      : `Last seen ${formatLastSeen(activeChat.otherUser.lastSeen)}`
                    }
                  </div>
                </div>
              </div>
              <button 
                className="btn-close"
                onClick={closeChat}
                title="Close chat"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="messages-container">
              {currentMessages.map((message, index) => (
                <div 
                  key={message._id}
                  className={`message ${message.senderId._id === user._id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                    {message.senderId._id === user._id && (
                      <span className="message-status">
                        {message.isRead ? (
                          <i className="fas fa-check-double read"></i>
                        ) : (
                          <i className="fas fa-check"></i>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {typingUsers[activeChat.otherUser._id] && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">{activeChat.otherUser.fullName} is typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <div className="message-input-container">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="message-input"
                  disabled={!isConnected}
                />
                <button 
                  type="submit"
                  className="send-button"
                  disabled={!messageInput.trim() || !isConnected}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow; 