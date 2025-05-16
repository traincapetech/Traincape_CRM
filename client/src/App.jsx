// src/App.jsx
import React from "react";
import AllRoutes from "./routes/AllRoutes";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <AuthProvider>
      <AllRoutes />
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default App;
