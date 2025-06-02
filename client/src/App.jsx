// src/App.jsx
import React, { useEffect } from "react";
import { HashRouter as Router } from "react-router-dom";
import AllRoutes from "./routes/AllRoutes";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';
import FloatingAIButton from "./components/AI/FloatingAIButton";
import notificationService from "./services/notificationService";

// Component to handle notification service initialization
const NotificationHandler = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      console.log('🔔 Initializing notifications for user:', user.fullName);
      
      // Connect to notification service
      notificationService.connect(user._id);
      
      // Request notification permission
      notificationService.requestNotificationPermission();
      
      // Cleanup on unmount
      return () => {
        notificationService.disconnect();
      };
    }
  }, [user]);

  return null; // This component doesn't render anything
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
          <NotificationHandler />
          <AllRoutes />
          <FloatingAIButton />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
