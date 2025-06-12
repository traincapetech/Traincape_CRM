import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.audioContext = null;
    this.notificationSound = null;
    this.initializeAudio();
  }

  // Initialize audio context and load notification sound
  initializeAudio() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create notification sound using Web Audio API
      this.createNotificationSound();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  // Create a beep sound using Web Audio API
  createNotificationSound() {
    if (!this.audioContext) return;

    const createBeep = (frequency = 800, duration = 200) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    };

    this.notificationSound = createBeep;
  }

  // Play notification sound
  playNotificationSound() {
    try {
      if (this.audioContext && this.notificationSound) {
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        
        // Play multiple beeps for urgency
        this.notificationSound(800, 300); // First beep
        setTimeout(() => this.notificationSound(1000, 300), 400); // Second beep
        setTimeout(() => this.notificationSound(800, 300), 800); // Third beep
      } else {
        // Fallback: try to play a system beep
        console.log('\u0007'); // Bell character
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  // Connect to WebSocket server
  connect(userId) {
    if (this.isConnected && this.userId === userId) {
      return; // Already connected for this user
    }

    this.userId = userId;
    
    // Determine server URL based on environment
    const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
    const apiUrl = isDevelopment ? 'http://localhost:8080/api' : (import.meta.env?.VITE_API_URL || 'https://crm-backend-o36v.onrender.com/api');
    const serverUrl = apiUrl.replace('/api', ''); // Remove /api for socket connection

    console.log('Connecting to notification server:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to notification server');
      this.isConnected = true;
      
      // Join user's personal room
      this.socket.emit('join-user-room', userId);
      
      toast.success('🔔 Notifications enabled');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast.error('Failed to connect to notification server');
    });

    // Listen for exam reminders
    this.socket.on('exam-reminder', (notification) => {
      this.handleExamReminder(notification);
    });

    // Listen for other notification types
    this.socket.on('notification', (notification) => {
      this.handleGeneralNotification(notification);
    });
  }

  // Handle exam reminder notifications
  handleExamReminder(notification) {
    console.log('🚨 Exam reminder received:', notification);

    // Play urgent sound
    if (notification.sound) {
      this.playNotificationSound();
    }

    // Show browser notification if permission granted
    this.showBrowserNotification(notification);

    // Show toast notification with custom content
    const toastContent = `
      🚨 ${notification.title}
      
      ${notification.message}
      
      Course: ${notification.examDetails.course}
      Time: ${notification.examDetails.time}
    `;

    toast(toastContent, {
      duration: 30000, // Show for 30 seconds
      position: 'top-center',
      style: {
        background: '#fee2e2',
        border: '2px solid #dc2626',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '400px',
        fontSize: '14px',
        lineHeight: '1.4'
      },
      icon: '🚨'
    });

    // Show modal for critical exam notifications
    this.showExamModal(notification);
  }

  // Handle general notifications
  handleGeneralNotification(notification) {
    console.log('📢 General notification received:', notification);

    toast(notification.message, {
      icon: notification.icon || '📢',
      duration: 5000,
      position: 'top-right'
    });
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'exam-reminder',
        requireInteraction: true,
        silent: false
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        
        // Navigate to exam if link available
        if (notification.examDetails.examLink && notification.examDetails.examLink !== '#') {
          window.open(notification.examDetails.examLink, '_blank');
        }
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }
  }

  // Show exam modal (you can implement this as a React component)
  showExamModal(notification) {
    // This would typically trigger a modal component
    // For now, we'll use a simple alert as fallback
    const examInfo = notification.examDetails;
    const message = `🚨 EXAM ALERT 🚨\n\nYour ${examInfo.course} exam starts in 10 minutes!\n\nTime: ${examInfo.time}\nLocation: ${examInfo.location}`;
    
    // Use setTimeout to show alert after toast
    setTimeout(() => {
      if (window.confirm(message + '\n\nClick OK to start exam or Cancel to dismiss.')) {
        if (examInfo.examLink && examInfo.examLink !== '#') {
          window.open(examInfo.examLink, '_blank');
        }
      }
    }, 1000);
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('🔔 Browser notifications enabled');
        return true;
      } else {
        toast.error('❌ Browser notifications denied');
        return false;
      }
    }
    return false;
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
      console.log('Disconnected from notification server');
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 