import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user && token) {
      // Support both Vite and Create React App environment variables
      const serverUrl = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';
      console.log('🔌 Connecting to chat server:', serverUrl);
      console.log('👤 User:', user.fullName, 'Role:', user.role);
      console.log('🔑 Token present:', !!token);
      
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
        auth: {
          token: token
        },
        query: {
          userId: user._id,
          userRole: user.role
        }
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to chat server');
        setIsConnected(true);
        
        // Join user room for targeted messages
        newSocket.emit('join-user-room', user._id);
        console.log('📡 Joined user room:', user._id);
        
        // Update user status to online
        updateUserStatus('ONLINE');
        
        // Fetch initial data
        fetchAllUsers();
        fetchChatRooms();
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
        
        // Show user-friendly error message
        toast.error('Failed to connect to chat server. Please refresh the page.');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from chat server:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          newSocket.connect();
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to chat server, attempt:', attemptNumber);
        setIsConnected(true);
        // Rejoin user room after reconnection
        newSocket.emit('join-user-room', user._id);
        updateUserStatus('ONLINE');
        
        toast.success('Reconnected to chat server');
      });

      // Handle new messages
      newSocket.on('newMessage', (message) => {
        setMessages(prev => ({
          ...prev,
          [message.chatId]: [...(prev[message.chatId] || []), message]
        }));

        // Update unread count if not in active chat
        if (!activeChat || activeChat.chatId !== message.chatId) {
          setUnreadCounts(prev => ({
            ...prev,
            [message.senderId._id]: (prev[message.senderId._id] || 0) + 1
          }));
        }

        // Update chat rooms with latest message
        setChatRooms(prev => prev.map(room => 
          room.chatId === message.chatId 
            ? { ...room, lastMessage: message.content, lastMessageTime: message.timestamp }
            : room
        ));
      });

      // Handle message notifications
      newSocket.on('messageNotification', (notification) => {
        if (!isChatOpen) {
          toast.info(`New message from ${notification.senderName}: ${notification.content.substring(0, 50)}...`);
        }
      });

      // Handle user status updates
      newSocket.on('userStatusUpdate', (statusUpdate) => {
        setOnlineUsers(prev => prev.map(user => 
          user._id === statusUpdate.userId 
            ? { ...user, chatStatus: statusUpdate.status, lastSeen: statusUpdate.lastSeen }
            : user
        ));

        setChatRooms(prev => prev.map(room => 
          room.otherUser._id === statusUpdate.userId
            ? { ...room, otherUser: { ...room.otherUser, chatStatus: statusUpdate.status, lastSeen: statusUpdate.lastSeen }}
            : room
        ));
      });

      // Handle typing indicators
      newSocket.on('userTyping', (typingData) => {
        const { senderId, isTyping } = typingData;
        
        setTypingUsers(prev => ({
          ...prev,
          [senderId]: isTyping
        }));

        // Clear typing indicator after 3 seconds
        if (isTyping) {
          if (typingTimeoutRef.current[senderId]) {
            clearTimeout(typingTimeoutRef.current[senderId]);
          }
          
          typingTimeoutRef.current[senderId] = setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [senderId]: false
            }));
          }, 3000);
        }
      });

      // Handle message delivery confirmation
      newSocket.on('messageDelivered', (confirmation) => {
        console.log('Message delivered:', confirmation);
      });

      // Handle message errors
      newSocket.on('messageError', (error) => {
        toast.error(`Failed to send message: ${error.error}`);
      });

      setSocket(newSocket);
      socketRef.current = newSocket;

      return () => {
        newSocket.close();
        setSocket(null);
        socketRef.current = null;
        setIsConnected(false);
      };
    }
  }, [user, token]);

  // Send message
  const sendMessage = (recipientId, content, messageType = 'text') => {
    if (socket && user) {
      const messageData = {
        senderId: user._id,
        recipientId,
        content,
        messageType
      };

      socket.emit('sendMessage', messageData);

      // Optimistically add message to local state
      const chatId = [user._id, recipientId].sort().join('_');
      const optimisticMessage = {
        _id: Date.now().toString(), // Temporary ID
        chatId,
        senderId: user,
        recipientId: { _id: recipientId },
        content,
        messageType,
        timestamp: new Date(),
        isRead: false,
        isOptimistic: true
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), optimisticMessage]
      }));
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (recipientId, isTyping) => {
    if (socket && user) {
      socket.emit('typing', {
        senderId: user._id,
        recipientId,
        isTyping
      });
    }
  };

  // Update user status
  const updateUserStatus = (status) => {
    if (socket && user) {
      socket.emit('updateStatus', {
        userId: user._id,
        status
      });
    }
  };

  // Fetch chat rooms
  const fetchChatRooms = async () => {
    try {
      const serverUrl = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${serverUrl}/api/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatRooms(data.data);
        
        // Set unread counts
        const counts = {};
        data.data.forEach(room => {
          if (room.unreadCount > 0) {
            counts[room.otherUser._id] = room.unreadCount;
          }
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  // Fetch messages for a specific chat
  const fetchMessages = async (recipientId) => {
    try {
      const serverUrl = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${serverUrl}/api/chat/messages/${recipientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const chatId = [user._id, recipientId].sort().join('_');
        setMessages(prev => ({
          ...prev,
          [chatId]: data.data
        }));

        // Clear unread count for this user
        setUnreadCounts(prev => ({
          ...prev,
          [recipientId]: 0
        }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch all users for chat
  const fetchAllUsers = async () => {
    try {
      const serverUrl = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${serverUrl}/api/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Start chat with user
  const startChat = async (otherUser) => {
    setActiveChat({
      chatId: [user._id, otherUser._id].sort().join('_'),
      otherUser
    });
    
    await fetchMessages(otherUser._id);
    setIsChatOpen(true);
  };

  // Close chat
  const closeChat = () => {
    setActiveChat(null);
    setIsChatOpen(false);
  };

  const value = {
    socket,
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
    updateUserStatus,
    fetchChatRooms,
    fetchMessages,
    fetchAllUsers,
    startChat,
    closeChat,
    setIsChatOpen
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 