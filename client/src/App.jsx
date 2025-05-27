// src/App.jsx
import React from "react";
import { HashRouter as Router } from "react-router-dom";
import AllRoutes from "./routes/AllRoutes";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';
import FloatingAIButton from "./components/AI/FloatingAIButton";
import ThemeToggle from "./components/ThemeToggle";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
          <ThemeToggle />
          <AllRoutes />
          <FloatingAIButton />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
};


export default App;
